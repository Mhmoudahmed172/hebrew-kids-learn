import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "هل المنصة مناسبة لطفل لم يسبق له تعلم العبرية؟", a: "نعم تماماً! المنصة مصممة لتبدأ من الصفر، من تعلم الحروف العبرية الأساسية وصولاً إلى المحادثة الكاملة." },
  { q: "ما هي الفئة العمرية المناسبة؟", a: "المنصة مصممة للأطفال من 5 إلى 10 سنوات، بمحتوى متدرج يناسب كل مرحلة عمرية." },
  { q: "كم من الوقت يحتاج طفلي يومياً؟", a: "نوصي بـ 15 إلى 20 دقيقة يومياً للحصول على أفضل نتائج، لكن يمكن لطفلك التعلم بالوتيرة التي تناسبه." },
  { q: "هل يمكنني متابعة تقدم طفلي؟", a: "بالتأكيد! لوحة تحكم الأهل تعطيك تقارير مفصلة عن وقت الدراسة، الدروس المكتملة، والمهارات المكتسبة." },
  { q: "هل يمكنني إلغاء الاشتراك في أي وقت؟", a: "نعم، يمكنك إلغاء اشتراكك في أي وقت بدون أي رسوم إضافية أو شروط معقدة." },
  { q: "هل المحتوى آمن لطفلي؟", a: "كل المحتوى مراجَع بعناية من قبل مختصين تربويين، وبيئة المنصة آمنة 100% بدون إعلانات أو محتوى خارجي." },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-muted/40">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <span className="inline-block bg-accent-soft text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ❓ الأسئلة الشائعة
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            كل ما تريد <span className="text-gradient">معرفته</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card rounded-2xl border border-border/50 px-6 shadow-soft"
            >
              <AccordionTrigger className="font-display text-lg text-right hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-base">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
