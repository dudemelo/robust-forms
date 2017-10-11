import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter,
  Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { AngularForms, Status } from '.';
import { Group } from './group';
import { DependencyService, Select, SelectService, Question } from './question';
import { ReactiveFormsFactory } from './factory';
import { StringUtils } from './util';

@Component({
  selector: 'rb-angular-forms',
  templateUrl: './angular-forms.component.html'
})
export class AngularFormsComponent implements OnInit, OnChanges, AfterViewChecked {

  public readonly Status: Object = Status;

  public formGroup: FormGroup;
  public submitted: boolean = false;

  @Input() public groups: Group<any>[] = [];
  @Input() public lang: string = 'en-US';
  @Input() public readOnly: boolean = false;

  @Output() public error: EventEmitter<Error> = new EventEmitter();
  @Output() public ready: EventEmitter<boolean> = new EventEmitter();

  private _status: Status;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService
  ) { }

  public ngOnInit(): void {
    this.configTranslate();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['groups']) {
      const groups: Group<any>[] = changes['groups'].currentValue;

      if (groups && groups.length) {
        this._status = Status.LOADING;
        this.load()
          .then(() => {
            this._status = Status.READY;
            this.ready.emit();
          })
          .catch((error: Error) => {
            this._status = Status.ERROR;
            this.printErrorLog(error);
            this.error.emit(error);
          });
      } else {
        this.clear();
      }
    }
  }

  public ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  public getGroupByCode(code: string): Group<any> {
    for (const group of this.groups) {
      if (group.code === code) {
        return group;
      }
    }
  }

  public hideQuestion(question: Question<any>, formGroup: FormGroup): boolean {
    return DependencyService.hideQuestion(question, formGroup);
  }

  public onChangeOptionSelect(htmlFormControl: HTMLInputElement, formControl: FormControl, question: Select): void {
    SelectService.onChangeOption(htmlFormControl, formControl, question);
  }

  public submit(): void {
    this.submitted = true;
  }

  public getForm(): { valid: boolean, value: Object } {
    return { valid: this.isValid(), value: this.getAnswersGroups() };
  }

  public isPristine(): boolean {
    return this.formGroup.pristine;
  }

  public isDirty(): boolean {
    return this.formGroup.dirty;
  }

  public isValid(): boolean {
    return this.formGroup.valid;
  }

  public getAnswersGroups(): Object {
    const answersGroups: Object = this.formGroup.value;

    Object.keys(answersGroups).forEach((groupIndex: string) => {
      if (answersGroups[groupIndex] instanceof Array) {
        (<Array<Object>>answersGroups[groupIndex]).map((answersGroup: Object) => this.convertAnswersOfGroupToString(answersGroup));

        return;
      }

      answersGroups[groupIndex] = this.convertAnswersOfGroupToString(answersGroups[groupIndex]);
    });

    return answersGroups;
  }

  public getAnswers(): Object {
    const answersGroups: Object = this.getAnswersGroups();
    const answers: Object = {};

    Object.keys(answersGroups).forEach((groupIndex: string) => {
      if (answersGroups[groupIndex] instanceof Array) {
        answers[groupIndex] = answersGroups[groupIndex];

        return;
      }

      Object.keys(answersGroups[groupIndex])
        .forEach((questionIndex: string) => answers[questionIndex] = answersGroups[groupIndex][questionIndex]);
    });

    return answers;
  }

  public onError(error: Error): void {
    this.clear();
    this.printErrorLog(error);
    this.error.emit(error);
  }

  public get status(): Status {
    return this._status;
  }

  private configTranslate(): void {
    this.translateService.addLangs(['en-US', 'pt-BR']);
    this.translateService.setDefaultLang('en-US');
    this.translateService.use(this.lang || 'en-US');
  }

  private async load(): Promise<void> {
    return new Promise<void>(async (resolve: () => void, reject: (error: Error) => void) => {
      try {
        this.groups = await AngularForms.fromJson(this.groups);
        this.formGroup = await ReactiveFormsFactory.createFormGroupFromGroups(this.groups);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private convertAnswersOfGroupToString(answersGroup: Object): Object {
    Object.keys(answersGroup)
      .forEach((questionIndex: string) => answersGroup[questionIndex] = StringUtils.convertToString(answersGroup[questionIndex]));

    return answersGroup;
  }

  private clear(): void {
    this._status = null;
    this.formGroup = null;
  }

  private printErrorLog(error: Error): void {
    console.error(`[AngularForms] ${error.name} :: ${error.message}`);
  }
}
