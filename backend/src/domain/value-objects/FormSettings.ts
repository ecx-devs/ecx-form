export interface FormSettingsProps {
  limitToOneResponse: boolean;
  allowResponseEditing: boolean;
  confirmationMessage: string;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
}

export class FormSettings {
  readonly limitToOneResponse: boolean;
  readonly allowResponseEditing: boolean;
  readonly confirmationMessage: string;
  readonly showProgressBar: boolean;
  readonly shuffleQuestions: boolean;

  private constructor(props: FormSettingsProps) {
    this.limitToOneResponse = props.limitToOneResponse;
    this.allowResponseEditing = props.allowResponseEditing;
    this.confirmationMessage = props.confirmationMessage;
    this.showProgressBar = props.showProgressBar;
    this.shuffleQuestions = props.shuffleQuestions;
  }

  static default(): FormSettings {
    return new FormSettings({
      limitToOneResponse: false,
      allowResponseEditing: false,
      confirmationMessage: 'Your response has been recorded.',
      showProgressBar: true,
      shuffleQuestions: false,
    });
  }

  static create(props: Partial<FormSettingsProps>): FormSettings {
    const defaults = FormSettings.default();
    return new FormSettings({
      limitToOneResponse: props.limitToOneResponse ?? defaults.limitToOneResponse,
      allowResponseEditing: props.allowResponseEditing ?? defaults.allowResponseEditing,
      confirmationMessage: props.confirmationMessage ?? defaults.confirmationMessage,
      showProgressBar: props.showProgressBar ?? defaults.showProgressBar,
      shuffleQuestions: props.shuffleQuestions ?? defaults.shuffleQuestions,
    });
  }

  static merge(current: FormSettings, updates: Partial<FormSettings>): FormSettings {
    return new FormSettings({
      limitToOneResponse: updates.limitToOneResponse ?? current.limitToOneResponse,
      allowResponseEditing: updates.allowResponseEditing ?? current.allowResponseEditing,
      confirmationMessage: updates.confirmationMessage ?? current.confirmationMessage,
      showProgressBar: updates.showProgressBar ?? current.showProgressBar,
      shuffleQuestions: updates.shuffleQuestions ?? current.shuffleQuestions,
    });
  }

  toJSON(): FormSettingsProps {
    return {
      limitToOneResponse: this.limitToOneResponse,
      allowResponseEditing: this.allowResponseEditing,
      confirmationMessage: this.confirmationMessage,
      showProgressBar: this.showProgressBar,
      shuffleQuestions: this.shuffleQuestions,
    };
  }
}

