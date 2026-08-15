import {useQuery}                           from "@tanstack/react-query";
import {Progress}                           from "@/components/ui/progress";
import {Alert, AlertDescription}            from "@/components/ui/alert";
import {Button}                             from "@/components/ui/button";
import {UserCheck, AlertTriangle, Infinity} from "lucide-react";

interface UsageStatus {
    isAuthenticated: boolean;
    isUnlimited?: boolean;
    dailyLimit?: number;
    dailyUsed?: number;
    totalLimit?: number;
    totalUsed?: number;
    remaining: number;
}

/** Displays the current user's available verse-generation allowance. */
export default function UsageIndicator() {
    const {
              data: usage,
              isLoading,
          } = useQuery<UsageStatus>({
                                        queryKey:        ["/api/usage/status"],
                                        refetchInterval: 60000, // Refresh every minute
                                    });
    
    if (isLoading || !usage) {
        return <div className="animate-pulse h-16 bg-gray-100 rounded-lg"/>;
    }
    
    if (usage.isUnlimited) {
        return (
            <Alert className="border-green-200 bg-green-50">
                <Infinity className="h-4 w-4 text-green-600"/>
                <AlertDescription className="text-green-800">
                    <strong>Unlimited access</strong> - No usage limits apply to your User
                    Account.
                </AlertDescription>
            </Alert>
        );
    }
    
    if (usage.isAuthenticated) {
        // Authenticated user - daily limits
        const percentUsed =
                  (
                      (
                          usage.dailyUsed || 0
                      ) / (
                          usage.dailyLimit || 100
                      )
                  ) * 100;
        const isNearLimit = percentUsed > 80;
        
        return (
            <Alert
                className={`${isNearLimit ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}`}
            >
                <UserCheck
                    className={`h-4 w-4 ${isNearLimit ? "text-orange-600" : "text-blue-600"}`}
                />
                <AlertDescription
                    className={isNearLimit ? "text-orange-800" : "text-blue-800"}
                >
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
              <span>
                Your daily usage ({usage.dailyUsed}/{usage.dailyLimit} verses)
              </span>
                            <span>{usage.remaining} remaining</span>
                        </div>
                        <Progress value={percentUsed} className="h-2"/>
                        {isNearLimit && (
                            <p className="text-xs">
                                You're approaching your daily usage limit. The daily usage
                                counters will reset at midnight.
                            </p>
                        )}
                    </div>
                </AlertDescription>
            </Alert>
        );
    } else {
        // Anonymous user - total limits
        const percentUsed =
                  (
                      (
                          usage.totalUsed || 0
                      ) / (
                          usage.totalLimit || 10
                      )
                  ) * 100;
        const isNearLimit = percentUsed > 60;
        
        return (
            <Alert
                className={`${isNearLimit ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}`}
            >
                <AlertTriangle
                    className={`h-4 w-4 ${isNearLimit ? "text-red-600" : "text-yellow-600"}`}
                />
                <AlertDescription
                    className={isNearLimit ? "text-red-800" : "text-yellow-800"}
                >
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
              <span>
                Anonymous user usage ({usage.totalUsed}/{usage.totalLimit}{" "}
                  verses)
              </span>
                            <span>{usage.remaining} remaining</span>
                        </div>
                        <Progress value={percentUsed} className="h-2"/>
                        <div className="flex items-center justify-between">
                            <p className="text-xs">
                                {isNearLimit
                                 ? "Almost at your daily usage limit! Sign in, for more daily verses."
                                 : "Limited usage access, without sign-in."}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    // Scroll down to the usage limits section with sign-in panel
                                    const usageLimitsElement = document.querySelector(
                                        '[class*="bg-gradient-to-r from-blue-50 to-indigo-50"]',
                                    );
                                    if (usageLimitsElement) {
                                        usageLimitsElement.scrollIntoView({
                                                                              behavior: "smooth",
                                                                              block:    "center",
                                                                          });
                                    }
                                }}
                                className="text-xs px-2 py-1"
                            >
                                Sign in, for increased daily limits!
                            </Button>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }
}
