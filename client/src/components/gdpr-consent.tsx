import React, {useState}                                                  from "react";
import {Button}                                                           from "@/components/ui/button";
import {Checkbox}                                                         from "@/components/ui/checkbox";
import {ScrollArea}                                                       from "@/components/ui/scroll-area";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";
import {ExternalLink, Shield}                                             from "lucide-react";

interface GDPRConsentProps {
    children: React.ReactNode;
}

/** Wraps account actions with the GDPR consent dialog. */
export default function GDPRConsent({ children }: GDPRConsentProps) {
    const [open, setOpen] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);
    
    /** Starts the Google OAuth sign-in flow after consent is accepted. */
    const handleGoogleLogin = () => {
        if (consentGiven) {
            window.location.href = "/auth/google";
        }
    };
    
    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent className="max-h-[85vh] max-w-4xl mx-auto">
                <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2 text-classical-blue-800">
                        <Shield className="h-5 w-5"/>
                        Privacy Policy & Data Processing Terms
                    </DrawerTitle>
                </DrawerHeader>
                
                <div className="px-4 pb-6">
                    <ScrollArea className="h-[40vh] sm:h-[50vh] mb-6">
                        <div className="prose prose-sm max-w-none text-gray-700">
                            <h3 className="text-lg font-semibold text-classical-blue-800 mb-3">
                                Data Processing and Privacy Notice
                            </h3>
                            
                            <div className="space-y-4 text-sm leading-relaxed">
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        1. Data Controller
                                    </h4>
                                    <p>
                                        The Ancient Greek Verse to Music Composer application ("we",
                                        "our", "the service") processes your personal data. For data
                                        protection inquiries, contact:
                                        <span className="font-medium">
                      {" "}
                                            <a href={`mailto:${__GDPR_DPO_EMAIL__}`}>
                        {__GDPR_DPO_EMAIL__}
                      </a>
                    </span>
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        2. Legal Basis for Processing
                                    </h4>
                                    <p>
                                        We process your personal data based on your consent (GDPR
                                        Article 6(1)(a)) and for the legitimate interest of
                                        providing our musical composition service (GDPR Article
                                        6(1)(f)).
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        3. Data We Collect
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            <strong>Google Account Data:</strong> Email address, first
                                            name, last name.
                                        </li>
                                        <li>
                                            <strong>Generated Files:</strong> MIDI file metadata only
                                            (filename, generation settings, timestamps).
                                        </li>
                                        <li>
                                            <strong>Technical Data:</strong> Session data, anonymized
                                            usage statistics.
                                        </li>
                                        <li>
                                            <strong>Download History:</strong> File metadata and
                                            generation history.
                                        </li>
                                        <li>
                                            <strong>Important:</strong> We do NOT store verse texts or
                                            metrical analysis data.
                                        </li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        4. How We Use Your Data
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            Authenticate your account and maintain login sessions.
                                        </li>
                                        <li>Store and manage your generated MIDI compositions.</li>
                                        <li>Provide download history and file management.</li>
                                        <li>Apply usage limits and prevent service abuse.</li>
                                        <li>
                                            Academic research in ancient Greek metrics and musical
                                            representation.
                                        </li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        5. Data Storage and Security
                                    </h4>
                                    <p>
                                        Your data is stored securely using industry-standard
                                        practices. Generated MIDI files are stored locally on our
                                        servers with database metadata. We implement appropriate
                                        technical and organizational measures to protect your data.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        6. Data Retention
                                    </h4>
                                    <p>
                                        We retain your account data and generated files until you
                                        request deletion. Anonymous usage statistics are retained
                                        only for current academic research purposes.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        7. Third-Party Services
                                    </h4>
                                    <p>
                                        We use Google OAuth for authentication. By logging in, you
                                        agree to{" "}
                                        <a
                                            href="https://policies.google.com/privacy"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Google's Privacy Policy
                                        </a>{" "}
                                        and{" "}
                                        <a
                                            href="https://policies.google.com/terms"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Terms of Service
                                        </a>
                                        . We do not share your data with other third parties except
                                        as required by law.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        8. Your GDPR Rights
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            <strong>Right of Access:</strong> Request copies of your
                                            personal data.
                                        </li>
                                        <li>
                                            <strong>Right to Rectification:</strong> Correct
                                            inaccurate personal data.
                                        </li>
                                        <li>
                                            <strong>Right to Erasure:</strong> Request deletion of
                                            your personal data.
                                        </li>
                                        <li>
                                            <strong>Right to Data Portability:</strong> Export your
                                            data in a structured format.
                                        </li>
                                        <li>
                                            <strong>Right to Object:</strong> Object to processing
                                            based on legitimate interests.
                                        </li>
                                        <li>
                                            <strong>Right to Withdraw Consent:</strong> Withdraw
                                            consent at any time.
                                        </li>
                                    </ul>
                                    <p className="mt-2">
                                        <strong>
                                            Access, Rectification, Erasure, and Data Portability
                                        </strong>{" "}
                                        can be exercised through the GDPR Actions panel in your
                                        account settings. For <strong>Right to Object</strong> and{" "}
                                        <strong>Withdraw Consent</strong>, contact us at
                                        <a href={`mailto:${__GDPR_DPO_EMAIL__}`}>
                                            {__GDPR_DPO_EMAIL__}
                                        </a>
                                        .
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800">
                                        9. Contact and Complaints
                                    </h4>
                                    <p>
                                        For privacy concerns, contact:{" "}
                                        <a href={`mailto:${__GDPR_DPO_EMAIL__}`}>
                                            {__GDPR_DPO_EMAIL__}
                                        </a>
                                        .
                                        <br/>
                                        You have the right to lodge a complaint with your local data
                                        protection authority.
                                    </p>
                                </div>
                                
                                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-800">
                                        <strong>Privacy First:</strong> We only store MIDI file
                                        metadata and generation settings. Your verse texts and
                                        metrical analysis are processed in real-time and never
                                        stored in our database, ensuring complete privacy of your
                                        academic content.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
                            <Checkbox
                                id="gdpr-consent"
                                checked={consentGiven}
                                onCheckedChange={(checked) => setConsentGiven(checked === true)}
                                className="mt-1"
                            />
                            <label
                                htmlFor="gdpr-consent"
                                className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                            >
                                I have read and understood the privacy policy and data
                                processing terms above. I consent to the collection, processing,
                                and storage of my personal data as described. I understand my
                                GDPR rights and how to exercise them.
                                <span className="text-red-600 ml-1">*</span>
                            </label>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleGoogleLogin}
                                disabled={!consentGiven}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                            >
                                <ExternalLink className="h-4 w-4 mr-2"/>
                                Continue with Google
                            </Button>
                            
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1 py-3"
                            >
                                Cancel
                            </Button>
                        </div>
                        
                        {!consentGiven && (
                            <p className="text-xs text-gray-500 text-center">
                                You must agree to the privacy terms, to continue with
                                authentication.
                            </p>
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
