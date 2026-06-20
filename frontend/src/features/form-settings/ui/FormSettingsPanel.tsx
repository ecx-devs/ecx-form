"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useFormStore, useUpdateForm } from "@/entities/form";
import { submissionApi } from "@/entities/submission";
import { Button, Card, Input, Toggle, TextArea } from "@/shared/ui";
import toast from "react-hot-toast";

export function FormSettingsPanel() {
  const { currentForm, updateSettings } = useFormStore();
  const updateFormMutation = useUpdateForm();
  const isFirstRender = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);

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

  const handleHeaderImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setIsUploadingHeader(true);

    try {
      const upload = await submissionApi.getSignedUploadUrl(
        currentForm.id,
        file.name,
        file.type,
        file.size,
      );
      await submissionApi.uploadFile(upload.signedUrl, file);
      const url = await submissionApi.getFileUrl(upload.path);
      updateSettings({ headerImageUrl: url });
      toast.success("Header image uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload header image");
    } finally {
      setIsUploadingHeader(false);
    }
  };

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

        <div className="space-y-6">
          <div>
            <p className="text-body-sm font-medium text-ecx-gray mb-2">
              Header image
            </p>
            {settings.headerImageUrl && (
              <div className="mb-3 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={settings.headerImageUrl}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHeaderImageUpload}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploadingHeader}
              >
                {settings.headerImageUrl ? "Change image" : "Upload image"}
              </Button>
              {settings.headerImageUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSettings({ headerImageUrl: null })}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div>
            <p className="text-body-sm font-medium text-ecx-gray mb-2">
              Theme color
            </p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.themeColor}
                onChange={(event) =>
                  updateSettings({ themeColor: event.target.value })
                }
                className="h-10 w-12 cursor-pointer rounded border border-gray-300 bg-white p-1"
              />
              <Input
                value={settings.themeColor}
                className="max-w-32 font-mono"
                maxLength={7}
                readOnly
              />
            </div>
          </div>

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
