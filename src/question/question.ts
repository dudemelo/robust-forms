import { Dependency } from '.';
import { Pattern, Validation } from '../validation';

export abstract class Question<Answer> {

  public constructor(
    private _name: string,
    private _description: string,
    private _dependencies: Dependency[] = [],
    private _type: string,
    private _answer: Answer = null,
    private _validations: Validation[] = []
  ) { }

  public isRequired(): boolean {
    for (const validation of this._validations) {
      if ('required' === validation.type || ('pattern' === validation.type && 'true' === (<Pattern>validation).value.toString())) {
        return true;
      }
    }

    return false;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get dependencies(): Dependency[] {
    return this._dependencies;
  }

  public get type(): string {
    return this._type;
  }

  public get answer(): Answer {
    return this._answer;
  }

  public get validations(): Validation[] {
    return this._validations;
  }
}
