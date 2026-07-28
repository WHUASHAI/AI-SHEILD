import { BookOpen, GraduationCap, Newspaper, Shield, Share2, Briefcase, Scale, FlaskConical, PenTool, Users, Building2, User } from 'lucide-react';

const cases = [
  { title: 'Students & Teachers', icon: BookOpen, desc: 'Verify academic integrity and ensure original writing in essays.' },
  { title: 'Schools & Universities', icon: GraduationCap, desc: 'Implement institution-wide scanning for admissions and coursework.' },
  { title: 'Journalists & Newsrooms', icon: Newspaper, desc: 'Verify source materials, images, and videos before publication.' },
  { title: 'Content Moderation', icon: Shield, desc: 'Filter synthetic spam and deepfakes from community platforms.' },
  { title: 'Social Media', icon: Share2, desc: 'Identify coordinated inauthentic behavior and synthetic campaigns.' },
  { title: 'Recruitment', icon: Briefcase, desc: 'Verify portfolios and application materials for authenticity.' },
  { title: 'Legal & Compliance', icon: Scale, desc: 'Establish the provenance of digital evidence.' },
  { title: 'Researchers', icon: FlaskConical, desc: 'Study the prevalence and impact of AI-generated media.' },
  { title: 'Creative Agencies', icon: PenTool, desc: 'Ensure purchased assets and freelance work are human-made.' },
  { title: 'Marketplace Admins', icon: Users, desc: 'Prevent fraud by verifying user-submitted product photos.' },
  { title: 'Government Orgs', icon: Building2, desc: 'Protect against misinformation and synthetic propaganda.' },
  { title: 'General Users', icon: User, desc: 'Fact-check viral content and media shared online.' },
];

export function UseCases() {
  return (
    <section className="py-20 bg-surface border-t border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Who Uses AI Shield?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by professionals across industries to verify digital authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {cases.map((c, i) => (
            <div key={i} className="p-5 rounded-xl bg-background border border-border hover:border-cyan-500/30 transition-colors">
              <c.icon className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-2">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
