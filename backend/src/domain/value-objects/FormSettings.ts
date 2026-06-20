export interface FormSettingsProps {
  limitToOneResponse: boolean;
  allowResponseEditing: boolean;
  confirmationMessage: string;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  acceptingResponses: boolean;
  themeColor: string;
  headerImageUrl?: string | null;
  headerImagePosition: string;
}

export class FormSettings {
  readonly limitToOneResponse: boolean;
  readonly allowResponseEditing: boolean;
  readonly confirmationMessage: string;
  readonly showProgressBar: boolean;
  readonly shuffleQuestions: boolean;
  readonly acceptingResponses: boolean;
  readonly themeColor: string;
  readonly headerImageUrl?: string;
  readonly headerImagePosition: string;

  private constructor(props: FormSettingsProps) {
    this.limitToOneResponse = props.limitToOneResponse;
    this.allowResponseEditing = props.allowResponseEditing;
    this.confirmationMessage = props.confirmationMessage;
    this.showProgressBar = props.showProgressBar;
    this.shuffleQuestions = props.shuffleQuestions;
    this.acceptingResponses = props.acceptingResponses;
    this.themeColor = props.themeColor;
    this.headerImageUrl = props.headerImageUrl ?? undefined;
    this.headerImagePosition = props.headerImagePosition;
  }

  static default(): FormSettings {
    return new FormSettings({
      limitToOneResponse: false,
      allowResponseEditing: false,
      confirmationMessage: "Your response has been recorded.",
      showProgressBar: true,
      shuffleQuestions: false,
      acceptingResponses: true,
      themeColor: "#2699e3",
      headerImageUrl: undefined,
      headerImagePosition: "center center",
    });
  }

  static create(props: Partial<FormSettingsProps>): FormSettings {
    const defaults = FormSettings.default();
    return new FormSettings({
      limitToOneResponse:
        props.limitToOneResponse ?? defaults.limitToOneResponse,
      allowResponseEditing:
        props.allowResponseEditing ?? defaults.allowResponseEditing,
      confirmationMessage:
        props.confirmationMessage ?? defaults.confirmationMessage,
      showProgressBar: props.showProgressBar ?? defaults.showProgressBar,
      shuffleQuestions: props.shuffleQuestions ?? defaults.shuffleQuestions,
      acceptingResponses:
        props.acceptingResponses ?? defaults.acceptingResponses,
      themeColor: props.themeColor ?? defaults.themeColor,
      headerImageUrl: props.headerImageUrl ?? defaults.headerImageUrl,
      headerImagePosition:
        props.headerImagePosition ?? defaults.headerImagePosition,
    });
  }

  static merge(
    current: FormSettings,
    updates: Partial<FormSettingsProps>,
  ): FormSettings {
    return new FormSettings({
      limitToOneResponse:
        updates.limitToOneResponse ?? current.limitToOneResponse,
      allowResponseEditing:
        updates.allowResponseEditing ?? current.allowResponseEditing,
      confirmationMessage:
        updates.confirmationMessage ?? current.confirmationMessage,
      showProgressBar: updates.showProgressBar ?? current.showProgressBar,
      shuffleQuestions: updates.shuffleQuestions ?? current.shuffleQuestions,
      acceptingResponses:
        updates.acceptingResponses ?? current.acceptingResponses,
      themeColor: updates.themeColor ?? current.themeColor,
      headerImageUrl:
        updates.headerImageUrl === null
          ? undefined
          : updates.headerImageUrl ?? current.headerImageUrl,
      headerImagePosition:
        updates.headerImagePosition ?? current.headerImagePosition,
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
      themeColor: this.themeColor,
      headerImageUrl: this.headerImageUrl,
      headerImagePosition: this.headerImagePosition,
    };
  }
}
