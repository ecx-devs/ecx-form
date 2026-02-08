export interface FormSettingsProps {
  limitToOneResponse: boolean;
  allowResponseEditing: boolean;
  confirmationMessage: string;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  acceptingResponses: boolean;
}

export class FormSettings {
  readonly limitToOneResponse: boolean;
  readonly allowResponseEditing: boolean;
  readonly confirmationMessage: string;
  readonly showProgressBar: boolean;
  readonly shuffleQuestions: boolean;
  readonly acceptingResponses: boolean;

  private constructor(props: FormSettingsProps) {
    this.limitToOneResponse = props.limitToOneResponse;
    this.allowResponseEditing = props.allowResponseEditing;
    this.confirmationMessage = props.confirmationMessage;
    this.showProgressBar = props.showProgressBar;
    this.shuffleQuestions = props.shuffleQuestions;
    this.acceptingResponses = props.acceptingResponses;
  }

  static default(): FormSettings {
    return new FormSettings({
      limitToOneResponse: false,
      allowResponseEditing: false,
      confirmationMessage: 'Your response has been recorded.',
      showProgressBar: true,
      shuffleQuestions: false,
      acceptingResponses: true,
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
      acceptingResponses: props.acceptingResponses ?? defaults.acceptingResponses,
    });
  }

  static merge(current: FormSettings, updates: Partial<FormSettings>): FormSettings {
    return new FormSettings({
      limitToOneResponse: updates.limitToOneResponse ?? current.limitToOneResponse,
      allowResponseEditing: updates.allowResponseEditing ?? current.allowResponseEditing,
      confirmationMessage: updates.confirmationMessage ?? current.confirmationMessage,
      showProgressBar: updates.showProgressBar ?? current.showProgressBar,
      shuffleQuestions: updates.shuffleQuestions ?? current.shuffleQuestions,
      acceptingResponses: updates.acceptingResponses ?? current.acceptingResponses,
    });
  }

  toJSON(): FormSettingsProps {
    return {
      limitToOneResponse: this.limitToOneResponse,
      allowResponseEditing: this.allowResponseEditing,
      confirmationMessage: this.confirmationMessage,
      showProgressBar: this.showProgressBar,
      shuffleQuestions: this.shuffleQuestions,
      acceptingResponses: this.acceptingResponses,
    };
  }
}

