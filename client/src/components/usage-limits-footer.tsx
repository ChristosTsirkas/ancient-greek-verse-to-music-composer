import {useQuery}                                from "@tanstack/react-query";
import {Card, CardContent}                       from "@/components/ui/card";
import {Progress}                                from "@/components/ui/progress";
import {UserCheck, Clock, Infinity, AlertCircle} from "lucide-react";
import AuthButton                                from "@/components/auth-button";

interface UsageStatus {
    isAuthenticated: boolean;
    isUnlimited?: boolean;
    dailyLimit?: number;
    dailyUsed?: number;
    totalLimit?: number;
    totalUsed?: number;
    remaining: number;
}

/** Displays usage-limit guidance in the page footer. */
export default function UsageLimitsFooter() {
    const {
              data: usage,
              isLoading,
          } = useQuery<UsageStatus>({
                                        queryKey:        ["/api/usage/status"],
                                        refetchInterval: 30000, // Refresh every 30 seconds
                                    });
    
    if (isLoading) {
        return (
            <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                    <div className="animate-pulse flex space-x-4">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (!usage) return null;
    
    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-blue-600"/>
                            Usage limits & status
                        </h3>
                        <AuthButton/>
                    </div>
                    
                    {usage.isUnlimited ? (
                        <div className="flex items-center justify-center space-x-2 text-green-700">
                            <Infinity className="h-6 w-6"/>
                            <span className="text-xl font-bold">Unlimited access</span>
                        </div>
                    ) : usage.isAuthenticated ? (
                        // Authenticated user display
                        <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2 text-blue-700">
                                <UserCheck className="h-5 w-5"/>
                                <span className="font-medium">Signed-in User usage limits</span>
                            </div>
                            
                            <div className="max-w-md mx-auto space-y-2">
                                <div className="flex justify-between text-sm font-medium text-gray-700">
                                    <span>Daily free verses:</span>
                                    <span className="text-blue-600">
                    {(
                         usage.dailyLimit || 0
                     ) >= 10000000
                     ? "Unlimited"
                     : `${usage.dailyLimit || 0} verses`}
                  </span>
                                </div>
                                
                                <div className="flex justify-between text-sm font-medium text-gray-700">
                                    <span>Verses used today:</span>
                                    <span className="text-gray-600">{usage.dailyUsed}</span>
                                </div>
                                
                                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">
                    Verses left to generate today:
                  </span>
                                    <span className="text-green-600">
                    {(
                         usage.dailyLimit || 0
                     ) >= 10000000
                     ? "Unlimited"
                     : usage.remaining}
                  </span>
                                </div>
                                
                                <Progress
                                    value={
                                        (
                                            (
                                                usage.dailyUsed || 0
                                            ) / (
                                                usage.dailyLimit || 100
                                            )
                                        ) * 100
                                    }
                                    className="h-2 mt-2"
                                />
                                
                                <p className="text-xs text-gray-500 mt-2">
                                    All daily per-user usage counters reset daily, at midnight.
                                </p>
                            </div>
                        </div>
                    ) : (
                            // Anonymous user display
                            <div className="space-y-3">
                                <div className="flex items-center justify-center space-x-2 text-orange-700">
                                    <AlertCircle className="h-5 w-5"/>
                                    <span className="font-medium">
                  Anonymous access - Limited usage
                </span>
                                </div>
                                
                                <div className="max-w-md mx-auto space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-gray-700">
                                        <span>Total free verses:</span>
                                        <span className="text-blue-600">{usage.totalLimit}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm font-medium text-gray-700">
                                        <span>Verses already used:</span>
                                        <span className="text-gray-600">{usage.totalUsed}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">
                    Verses left to generate:
                  </span>
                                        <span
                                            className={`${usage.remaining > 5 ? "text-green-600" : usage.remaining > 2 ? "text-orange-600" : "text-red-600"}`}
                                        >
                    {usage.remaining}
                  </span>
                                    </div>
                                    
                                    <Progress
                                        value={
                                            (
                                                (
                                                    usage.totalUsed || 0
                                                ) / (
                                                    usage.totalLimit || 10
                                                )
                                            ) * 100
                                        }
                                        className="h-2 mt-2"
                                    />
                                    
                                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-3">
                                        <p className="text-sm text-blue-800 font-medium">
                                            Sign in with Google, for increased daily limits!
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            • Persistent Downloads History.
                                            <br/>• Advanced GDPR features.
                                        </p>
                                        <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-blue-200">
                                            <p className="mb-2">
                                                <strong>Privacy & GDPR Compliance:</strong> We only
                                                collect basic Google profile information (name, email) for
                                                authentication. No personal data is shared with third
                                                parties.
                                            </p>
                                            <p>
                                                <strong>Your Rights:</strong>
                                                <br/>• Right to access, rectify, or delete your data
                                                <br/>• Right to data portability
                                                <br/>• Right to withdraw consent
                                                <br/>• Right to be forgotten (complete account deletion)
                                                <br/>• Contact{" "}
                                                <a href={`mailto:${__GDPR_DPO_EMAIL__}`}>
                                                    {__GDPR_DPO_EMAIL__}
                                                </a>{" "}
                                                for any data requests or to exercise your GDPR rights.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </CardContent>
        </Card>
    );
}
