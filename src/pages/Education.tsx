import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

const quizQuestions = [
{
  q: "What are the magic bytes for a JPEG file?",
  options: ["4D 5A", "FF D8 FF E0", "89 50 4E 47", "25 50 44 46"],
  answer: 1
},
{
  q: "What does the 'MZ' header indicate?",
  options: ["A ZIP archive", "A PNG image", "A Windows executable", "A PDF document"],
  answer: 2
},
{
  q: "Which technique uses right-to-left override to hide extensions?",
  options: ["Double extension", "Extension spoofing", "Header injection", "Byte stuffing"],
  answer: 1
},
{
  q: "What are the first 4 bytes of a PNG file?",
  options: ["25 50 44 46", "50 4B 03 04", "89 50 4E 47", "47 49 46 38"],
  answer: 2
}];


const masquerading = [
{
  title: "Double Extensions",
  example: "malware.pdf.exe",
  desc: "File appears as PDF but the real extension is .exe. Windows may hide the last extension."
},
{
  title: "Extension Spoofing (RLO)",
  example: "report\u202Eexe.pdf",
  desc: "Uses Unicode Right-to-Left Override character to reverse the visible extension."
},
{
  title: "Missing Extensions",
  example: "attachment (no extension)",
  desc: "Email attachments without extensions bypass simple extension-based filters."
}];


export default function Education() {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    magic: true,
    masq: false,
    impact: false,
    quiz: false
  });

  const toggle = (key: string) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const sections = [
  {
    key: "magic",
    title: "How Magic Bytes Work",
    content:
    <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Magic bytes (file signatures) are specific byte sequences at the beginning of a file that identify its format, regardless of the file extension.
          </p>
          <div className="cyber-card border-double">
            <p className="text-xs text-muted-foreground mb-2">Example: PNG file header</p>
            <div className="flex flex-wrap gap-1">
              {["89", "50", "4E", "47", "0D", "0A", "1A", "0A"].map((b, i) =>
          <span
            key={i}
            className={`inline-flex h-8 w-8 items-center justify-center rounded font-mono text-xs ${
            i < 4 ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}`
            }>

                  {b}
                </span>
          )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              First 4 bytes <span className="font-mono text-primary">89 50 4E 47</span> = PNG signature.
              The OS uses these bytes—not the .png extension—to determine the real file type.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
        { type: "JPEG", bytes: "FF D8 FF E0" },
        { type: "PDF", bytes: "25 50 44 46" },
        { type: "EXE", bytes: "4D 5A 90 00" }].
        map((f) =>
        <div key={f.type} className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs font-medium text-foreground">{f.type}</p>
                <p className="font-mono text-xs text-accent">{f.bytes}</p>
              </div>
        )}
          </div>
        </div>

  },
  {
    key: "masq",
    title: "Common Masquerading Techniques",
    content:
    <div className="space-y-3">
          {masquerading.map((m, i) =>
      <div key={i} className="cyber-card-warning">
              <p className="text-sm font-medium text-foreground">{m.title}</p>
              <p className="font-mono text-xs text-warning mt-1">{m.example}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
            </div>
      )}
        </div>

  },
  {
    key: "impact",
    title: "Real World Impact",
    content:
    <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
        { stat: "94%", label: "of malware delivered via email" },
        { stat: "43%", label: "use disguised file extensions" },
        { stat: "$4.45M", label: "avg cost of data breach (2023)" }].
        map((s, i) =>
        <div key={i} className="stat-card text-center">
                <p className="text-2xl font-bold font-mono text-primary">{s.stat}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
        )}
          </div>
          <div className="cyber-card">
            <h4 className="text-sm font-medium text-foreground mb-2">Case Study: Emotet Trojan</h4>
            <p className="text-xs text-muted-foreground">
              Emotet frequently used malicious Word documents with embedded macros, disguised with double extensions like <span className="font-mono text-warning">invoice.doc.exe</span>. Content-based file analysis would immediately identify the MZ header, revealing the executable nature.
            </p>
          </div>
        </div>

  },
  {
    key: "quiz",
    title: "Test Your Knowledge",
    content:
    <div className="space-y-4">
          {quizQuestions.map((q, qi) =>
      <div key={qi} className="cyber-card">
              <p className="text-sm text-foreground mb-3">{q.q}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
            const selected = quizAnswers[qi] === oi;
            const isCorrect = showResults && oi === q.answer;
            const isWrong = showResults && selected && oi !== q.answer;
            return (
              <button
                key={oi}
                onClick={() => !showResults && setQuizAnswers((p) => ({ ...p, [qi]: oi }))}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                isCorrect ?
                "border-primary bg-primary/10 text-primary" :
                isWrong ?
                "border-destructive bg-destructive/10 text-destructive" :
                selected ?
                "border-accent bg-accent/10 text-accent" :
                "border-border text-muted-foreground hover:border-muted-foreground"}`
                }>

                      {isCorrect && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                      {isWrong && <XCircle className="h-3 w-3 shrink-0" />}
                      {opt}
                    </button>);

          })}
              </div>
            </div>
      )}
          <button
        onClick={() => setShowResults(true)}
        disabled={Object.keys(quizAnswers).length < quizQuestions.length}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40 cyber-glow">

            Check Answers
          </button>
          {showResults &&
      <p className="text-sm text-foreground">
              Score:{" "}
              <span className="font-mono text-primary">
                {Object.entries(quizAnswers).filter(([qi, a]) => a === quizQuestions[Number(qi)].answer).length}
                /{quizQuestions.length}
              </span>
            </p>
      }
        </div>

  }];


  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">Education Center</h2>
          <p className="text-xs text-muted-foreground">Learn about file signature analysis</p>
        </div>
      </div>

      {sections.map((s) =>
      <div key={s.key} className="rounded-lg border border-border overflow-hidden">
          <button
          onClick={() => toggle(s.key)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/30 transition-colors">

            {s.title}
            {openSections[s.key] ?
          <ChevronDown className="h-4 w-4 text-muted-foreground" /> :

          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
          </button>
          {openSections[s.key] && <div className="px-4 pb-4">{s.content}</div>}
        </div>
      )}
    </div>);

}