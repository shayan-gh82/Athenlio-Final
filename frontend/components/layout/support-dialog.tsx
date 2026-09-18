"use client";
import { useState } from "react";
import { useLocale } from "next-intl";
import { Headphones } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function SupportDialog() {
  const fa = useLocale() === "fa";
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const schema = z.object({ subject: z.string().trim().min(3), category: z.string(), message: z.string().trim().min(10) });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { subject: "", category: "account", message: "" } });
  return <><Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => setOpen(true)}><Headphones />{fa ? "ارتباط با پشتیبانی" : "Contact support"}</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader className="text-start"><DialogTitle>{fa ? "پشتیبانی | نسخه آزمایشی" : "Support | Demo"}</DialogTitle><DialogDescription>{fa ? "این فرم نمایشی است؛ پیام برای پشتیبان ارسال نمی‌شود." : "This is a demonstration. Messages are not sent to a support agent."}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(() => setPreview(true))}>
        <Label htmlFor="support-category">{fa ? "موضوع درخواست" : "Category"}</Label><select id="support-category" className="w-full rounded-xl border bg-background p-3" {...form.register("category")}><option value="account">{fa ? "حساب کاربری" : "Account"}</option><option value="course">{fa ? "دوره و ثبت‌نام" : "Courses and enrollment"}</option><option value="technical">{fa ? "مشکل فنی" : "Technical issue"}</option></select>
        <Label htmlFor="support-subject">{fa ? "عنوان" : "Subject"}</Label><Input id="support-subject" {...form.register("subject")} aria-invalid={!!form.formState.errors.subject} />
        <Label htmlFor="support-message">{fa ? "متن پیام" : "Message"}</Label><Textarea id="support-message" rows={5} {...form.register("message")} aria-invalid={!!form.formState.errors.message} />
        {Object.keys(form.formState.errors).length ? <p role="alert" className="text-sm text-destructive">{fa ? "عنوان حداقل ۳ و پیام حداقل ۱۰ نویسه باشد." : "Use at least 3 characters for the subject and 10 for the message."}</p> : null}
        {preview ? <p role="status" className="rounded-xl bg-primary-soft p-4 text-sm">{fa ? "پیش‌نمایش فرم آماده است. هیچ پیامی ارسال نشده است." : "Form preview is ready. No message has been sent."}</p> : null}
        <Button type="submit">{fa ? "بررسی فرم آزمایشی" : "Preview demo request"}</Button>
      </form>
    </DialogContent></Dialog></>;
}
