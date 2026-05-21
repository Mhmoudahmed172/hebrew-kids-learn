import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

type F = { id: string; question: string; answer: string };

const FAQ = () => {
  const [faqs, setFaqs] = useState<F[]>([]);

  useEffect(() => {
    supabase
      .from("faqs")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .then(({ data }) => setFaqs((data as F[]) || []));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 bg-muted/40">
      <div className="container max-w-3xl">
        <div className="text-right mb-12">
          <span className="inline-block bg-accent-soft text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            ❓ الأسئلة الشائعة
          </span>
          <h2 className="font-display text-4xl lg:text-5xl mb-4">
            أسئلة <span className="text-gradient">يطرحها الأهل عادةً</span>
          </h2>
          <p className="text-muted-foreground">إجابات واضحة وصريحة لتطمئن قبل أن تبدأ.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((f) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="bg-card rounded-2xl border border-border/50 px-6 shadow-soft"
            >
              <AccordionTrigger className="font-display text-lg text-right hover:no-underline py-5">
                {f.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-base">
                {f.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
