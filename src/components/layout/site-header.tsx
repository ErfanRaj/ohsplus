@@
-import { ChevronDown, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, User } from "lucide-react";
+import { ChevronDown, LayoutDashboard, LogOut, Menu, ShieldCheck, User } from "lucide-react";
@@
-  const [searchOpen, setSearchOpen] = useState(false);
+  // search dialog removed — keep the state removed to avoid loading the lazy dialog
@@
-  useEffect(() => {
-    const onKeyDown = (event: KeyboardEvent) => {
-      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
-        event.preventDefault();
-        setSearchOpen(true);
-      }
-    };
-    document.addEventListener("keydown", onKeyDown);
-    return () => document.removeEventListener("keydown", onKeyDown);
-  }, []);
+  // search shortcut removed
@@
-          <Button
-            variant="ghost"
-            size="icon"
-            aria-label="جستجو در منابع"
-            onClick={() => setSearchOpen(true)}
-          >
-            <Search className="size-5" aria-hidden="true" />
-          </Button>
+          {/* Search removed from header to simplify UI */}
@@
-        {searchOpen ? (
-        <Suspense fallback={null}>
-          <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
-        </Suspense>
-      ) : null}
+        {/* Search dialog removed */}
@@
-export function SiteHeader() {
+export function SiteHeader() {
