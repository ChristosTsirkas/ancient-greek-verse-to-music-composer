import {Card, CardContent} from "@/components/ui/card";
import {AlertCircle}       from "lucide-react";

/** Renders the fallback page for unmatched routes. */
export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md mx-4">
                <CardContent className="pt-6">
                    <div className="flex mb-4 gap-2">
                        <AlertCircle className="h-8 w-8 text-red-500"/>
                        <h1 className="text-2xl font-bold text-gray-900">
                            404 Page Not Found
                        </h1>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-600">
                        The page you seek has wandered off like Orpheus from Eurydice. No
                        lyre sings here, no chorus replies —only echoes in the void.
                        <br/>
                        <br/>
                        But take heart, traveler of rhythm and myth!
                        <br/>
                        Even Apollo’s notes once missed the mark.
                        <br/>
                        <br/>
                        🎶 Return to the homepage, and let harmony guide you again. Or
                        summon the Composer anew —perhaps your melody awaits elsewhere.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
