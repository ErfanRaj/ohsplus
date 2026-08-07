@@
   const handleSignUp = async (event: React.FormEvent) => {
     event.preventDefault();
     const values = validate();
     if (!values) return;
+    const nameTrim = fullName.trim();
+    if (!nameTrim) {
+      toast.error("لطفاً نام و نام خانوادگی خود را وارد کنید.");
+      return;
+    }
     setBusy(true);
     const { data, error } = await supabase.auth.signUp({
       ...values,
       options: {
         emailRedirectTo: `${window.location.origin}${destination}`,
-        data: { full_name: fullName.trim().slice(0, 100) },
+        data: { full_name: nameTrim.slice(0, 100) },
       },
     });
@@
   };
@@
 }
