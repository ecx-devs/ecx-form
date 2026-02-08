"use client";

import { useEffect, useRef } from "react";
import { useFormStore, useUpdateForm } from "@/entities/form";
import { Card, Toggle, TextArea } from "@/shared/ui";

export function FormSettingsPanel() {
  const { currentForm, updateSettings } = useFormStore();
  const updateFormMutation = useUpdateForm();
  const isFirstRender = useRef(true);

  // Auto-save settings when they change
  useEffect(() => {
    // Skip the first render to avoid saving on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!currentForm) return;

    const timeoutId = setTimeout(() => {
      updateFormMutation.mutate({
        id: currentForm.id,
        input: {
          settings: currentForm.settings,
        },
      });
    }, 1000); // 1 second debounce for settings

    return () => clearTimeout(timeoutId);
  }, [currentForm?.settings]);

  if (!currentForm) return null;

  const { settings } = currentForm;

  return (
    <div className="space-y-6">
      {/* Form Status */}
      <Card>
        <h3 className="text-heading-4 font-varela text-ecx-black mb-4">
          Form Status
        </h3>

        <div className="space-y-4">
          <Toggle
            label="Accepting responses"
            description="When turned off, the form will no longer accept new submissions"
            checked={settings.acceptingResponses}
            onChange={(checked) =>
              updateSettings({ acceptingResponses: checked })
            }
          />
        </div>
      </Card>

      {/* Response Settings */}
      <Card>
        <h3 className="text-heading-4 font-varela text-ecx-black mb-4">
          Responses
        </h3>

        <div className="space-y-4">
          <Toggle
            label="Limit to 1 response"
            description="Respondents will be required to sign in or be tracked via local storage"
            checked={settings.limitToOneResponse}
            onChange={(checked) =>
              updateSettings({ limitToOneResponse: checked })
            }
          />

          <Toggle
            label="Allow response editing"
            description="Respondents can edit their submitted response"
            checked={settings.allowResponseEditing}
            onChange={(checked) =>
              updateSettings({ allowResponseEditing: checked })
            }
          />
        </div>
      </Card>

      {/* Presentation Settings */}
      <Card>
        <h3 className="text-heading-4 font-varela text-ecx-black mb-4">
          Presentation
        </h3>

        <div className="space-y-4">
          <Toggle
            label="Show progress bar"
            description="Display a progress bar at the top of the form"
            checked={settings.showProgressBar}
            onChange={(checked) => updateSettings({ showProgressBar: checked })}
          />

          <Toggle
            label="Shuffle question order"
            description="Questions will be displayed in a random order"
            checked={settings.shuffleQuestions}
            onChange={(checked) =>
              updateSettings({ shuffleQuestions: checked })
            }
          />
        </div>
      </Card>

      {/* Confirmation Message */}
      <Card>
        <h3 className="text-heading-4 font-varela text-ecx-black mb-4">
          Confirmation Message
        </h3>

        <TextArea
          value={settings.confirmationMessage}
          onChange={(e) =>
            updateSettings({ confirmationMessage: e.target.value })
          }
          placeholder="Your response has been recorded."
          hint="This message will be shown after the form is submitted"
          maxLength={500}
          showCount
        />
      </Card>
    </div>
  );
}
