import { GroupBuilder } from '.';
import { Fieldset } from '../group';
import { Question } from '../question';

export class FieldsetBuilder extends GroupBuilder<Question<any>> {

  public constructor(
    code: string,
    description: string
  ) {
    super(code, description);
    this.questions = [];
  }

  public addQuestion(question: Question<any>): void {
    this.questions.push(question);
  }

  public build(): Fieldset {
    return new Fieldset(
      this.code,
      this.description,
      this.questions
    );
  }
}
