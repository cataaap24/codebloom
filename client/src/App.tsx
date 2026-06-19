import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Notes from "./pages/Notes";
import Stats from "./pages/Stats";
import Garden from "./pages/Garden";
import AppLayout from "./components/AppLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        <AppLayout><Dashboard /></AppLayout>
      </Route>
      <Route path="/courses">
        <AppLayout><Courses /></AppLayout>
      </Route>
      <Route path="/tasks">
        <AppLayout><Tasks /></AppLayout>
      </Route>
      <Route path="/calendar">
        <AppLayout><Calendar /></AppLayout>
      </Route>
      <Route path="/notes">
        <AppLayout><Notes /></AppLayout>
      </Route>
      <Route path="/stats">
        <AppLayout><Stats /></AppLayout>
      </Route>
      <Route path="/garden">
        <AppLayout><Garden /></AppLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
