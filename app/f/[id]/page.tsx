import dbConnect from "@/lib/mongodb";
import Form from "@/models/Form";
import { notFound } from "next/navigation";
import { FormRenderer } from "@/components/FormRenderer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Eye, Lock } from "lucide-react";
import Submission from "@/models/Submission";
import { cookies } from "next/headers";

async function getForm(id: string) {
    await dbConnect();
    const form = await Form.findById(id).lean();
    return form;
}

export default async function PublicFormPage({
    params,
    searchParams
}: {
    params: { id: string },
    searchParams: { preview?: string }
}) {
    const form = await getForm(params.id);

    if (!form) {
        return notFound();
    }

    const isPreview = searchParams.preview === 'true';
    const isActive = form.settings?.isActive ?? true;
    const expiryDate = form.settings?.expiryDate;
    const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

    // Response Limit Check
    const responseCount = await Submission.countDocuments({ formId: params.id });
    const isLimitReached = form.settings?.responseLimit > 0 && responseCount >= form.settings.responseLimit;

    // Single Submission Check
    const cookieStore = cookies();
    const hasSubmitted = cookieStore.get(`form_submitted_${params.id}`);
    const isSingleSubmissionActive = form.settings?.singleSubmission;

    if ((!isActive || isExpired || isLimitReached || (isSingleSubmissionActive && hasSubmitted)) && !isPreview) {
        let title = "This form is no longer accepting responses";
        let message = "The creator has temporarily disabled this form.";

        if (isExpired) message = "This form has expired and is no longer available.";
        else if (isLimitReached) message = "This form has reached its maximum response limit.";
        else if (isSingleSubmissionActive && hasSubmitted) {
            title = "Already Submitted";
            message = "You have already filled out this form.";
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center px-6">
                <div className="glass p-12 rounded-3xl border border-white/10 space-y-6">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        {isSingleSubmissionActive && hasSubmitted ? (
                            <Lock className="w-10 h-10 text-purple-400" />
                        ) : (
                            <XCircle className="w-10 h-10 text-red-400" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-muted-foreground">{message}</p>
                    <Link href="/">
                        <Button variant="ghost" className="glass border-white/10 gap-2 mt-4 hover:bg-white/5">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            {isPreview && (
                <div className="glass p-4 rounded-2xl border-purple-500/50 bg-purple-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-purple-300">
                        <Eye className="w-5 h-5" />
                        <p className="font-semibold">Preview Mode: Submissions are disabled.</p>
                    </div>
                </div>
            )}
            <FormRenderer form={JSON.parse(JSON.stringify(form))} isPreview={isPreview} />
        </div>
    );
}
