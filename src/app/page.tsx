import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Database,
  Download,
  Zap,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to LeadHarvester. Here's an overview of your lead generation
          activity.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Search queries created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contacts
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Contacts extracted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Extractions
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Extraction success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Extractions</CardTitle>
            <CardDescription>Your latest extraction jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No extractions yet.{" "}
              <a href="/queries" className="text-blue-600 hover:underline">
                Create your first query
              </a>{" "}
              to get started.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>
              Latest extracted contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No contacts extracted yet. Run an extraction to see results here.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/queries"
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium">Create Query</h3>
                <p className="text-sm text-gray-500">
                  Start a new search query
                </p>
              </div>
            </a>

            <a
              href="/contacts"
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Database className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium">View Contacts</h3>
                <p className="text-sm text-gray-500">
                  Browse extracted contacts
                </p>
              </div>
            </a>

            <a
              href="/export"
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Download className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-gray-500">Download your data</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
