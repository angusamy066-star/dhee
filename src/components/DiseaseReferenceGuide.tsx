import React, { useState } from 'react';
import {
  BookOpen,
  Bug,
  Flame,
  Activity,
  AlertOctagon,
  HeartPulse,
  Microscope,
  Cpu,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const DiseaseReferenceGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('infectious');

  const categories = [
    {
      id: 'infectious',
      name: 'Infectious & Contagious',
      icon: Flame,
      color: 'text-rose-400',
      description:
        'Rapidly spreading viral and bacterial pathogens that cause devastating trade embargoes and herd mortality.',
      diseases: [
        {
          name: 'Foot-and-Mouth Disease (FMD)',
          species: 'Cattle, Swine, Sheep, Goats',
          pathogen: 'Aphthovirus (Picornaviridae)',
          symptoms: 'Vesicular blisters on tongue, gums, teats, and interdigital cleft of feet. Drooling, lameness.',
          traditional: 'Oral and hoof visual examination, antigen detection ELISA, RT-PCR in reference laboratory.',
          aiModern: 'Thermal camera automated walk-through fever screening, wearable accelerometers detecting step count drops 24h prior.',
          biosecurity: 'Immediate quarantine perimeter, 4% sodium carbonate wash, ban on animal movement.',
        },
        {
          name: 'Highly Pathogenic Avian Influenza (HPAI H5N1)',
          species: 'Poultry, Waterfowl, Dairy Cattle',
          pathogen: 'Orthomyxovirus Influenza A (Clade 2.3.4.4b)',
          symptoms: 'Cyanosis of comb/wattles, severe drop in water intake, drop in dairy milk yield with colostrum-like texture.',
          traditional: 'Tracheal and cloacal swabs, rapid antigen test strip, real-time RT-PCR.',
          aiModern: 'Automated bio-acoustic bird vocalization tracking, water line electronic meters flagging &gt;30% drop in consumption.',
          biosecurity: 'Wild waterfowl exclusion netting, PPE (N95 respirators, face shields) for milkers, milk pasteurization.',
        },
        {
          name: 'African Swine Fever (ASF)',
          species: 'Domestic & Wild Swine',
          pathogen: 'Asfarviridae DNA Virus',
          symptoms: 'High fever (&gt;41°C), purple cyanotic ears/snout/tail, hemorrhagic diarrhea, near 100% mortality.',
          traditional: 'ELISA for antibody detection, PCR on whole blood and spleen tissues, necropsy showing dark congested spleen.',
          aiModern: 'Computer vision thermal scanning in barn corridors detecting fever clusters 36h before visible blotches.',
          biosecurity: 'Zero swill feeding policy, perimeter double fencing against wild boar contact, carcass incineration.',
        },
      ],
    },
    {
      id: 'metabolic',
      name: 'Metabolic & Production',
      icon: Activity,
      color: 'text-amber-400',
      description:
        'Nutritional and metabolic imbalances predominant in high-yield dairy cows and intensive feedlot operations.',
      diseases: [
        {
          name: 'Subclinical & Clinical Mastitis',
          species: 'Dairy Cattle, Dairy Sheep, Goats',
          pathogen: 'Staphylococcus aureus, Streptococcus uberis, E. coli',
          symptoms: 'Udder quarter swelling, heat, hardness, clotting/watery milk, decreased milk yield.',
          traditional: 'California Mastitis Test (CMT), somatic cell count (SCC) laboratory testing, bacterial culture.',
          aiModern: 'In-line automated electrical conductivity sensors, collar rumination tracking flagging -25% drop 28h before swelling.',
          biosecurity: 'Pre- and post-milking teat dips (chlorhexidine / iodine), clean dry bedding, milking cluster sanitation.',
        },
        {
          name: 'Ketosis & Fatty Liver Disease',
          species: 'Dairy Cattle (Early Lactation)',
          pathogen: 'Negative Energy Balance (Elevated BHB ketones)',
          symptoms: 'Sweet acetone odor on breath, rapid weight loss, lethargy, pica (licking foreign objects).',
          traditional: 'Urine acetoacetate strips, hand-held blood BHBA ketone meter (&ge;1.2-1.4 mmol/L).',
          aiModern: 'Automated feed bunk dwell-time cameras identifying cows eating &lt;70% dry matter intake baseline.',
          biosecurity: 'Transition cow nutritional management, propylene glycol drenching, rumen-protected choline.',
        },
        {
          name: 'Subacute Ruminal Acidosis (SARA)',
          species: 'Dairy & Beef Cattle',
          pathogen: 'Excess non-structural carbohydrate fermentation (Rumen pH &lt; 5.5)',
          symptoms: 'Foamy diarrhea with gas bubbles, undigested grain in feces, fluctuating appetite, secondary laminitis.',
          traditional: 'Rumenocentesis pH measurement, fecal sieve score.',
          aiModern: 'Wireless telemetry rumen boluses recording continuous pH and internal temperature every 15 minutes.',
          biosecurity: 'Adequate effective fiber (NDF) in total mixed ration (TMR), sodium bicarbonate buffer addition.',
        },
      ],
    },
    {
      id: 'parasitic',
      name: 'Parasitic Diseases',
      icon: Bug,
      color: 'text-teal-400',
      description:
        'Internal gastrointestinal parasites and external vector-borne parasites causing chronic production loss and anemia.',
      diseases: [
        {
          name: 'Haemonchosis (Barber Pole Worm)',
          species: 'Sheep, Goats, Calves',
          pathogen: 'Haemonchus contortus nematode',
          symptoms: 'Severe blood-loss anemia, chalk-white mucous membranes, submandibular edema ("bottle jaw"), sudden death.',
          traditional: 'FAMACHA ocular mucous membrane color scoring (grades 1 to 5), McMaster fecal egg count (FEC).',
          aiModern: 'Automated smart water trough camera taking ocular conjunctiva photographs to calculate automated FAMACHA scores.',
          biosecurity: 'Targeted selective treatment (TST) to prevent anthelmintic resistance; rotational pasture management.',
        },
        {
          name: 'Coccidiosis (Eimeria infection)',
          species: 'Calves, Lambs, Broiler Poultry',
          pathogen: 'Eimeria spp. protozoa',
          symptoms: 'Bloody or mucous foul-smelling diarrhea, tenesmus (straining), dehydration, rough hair coat.',
          traditional: 'Fecal flotation and microscopic oocyst identification, post-mortem intestinal scraping.',
          aiModern: 'Pen flooring image segmentation detecting stool discoloration and blood streaks autonomously.',
          biosecurity: 'Dry bedding management, elevated feed troughs to prevent fecal contamination, ionophore coccidiostats.',
        },
      ],
    },
    {
      id: 'reproductive',
      name: 'Reproductive Disorders',
      icon: HeartPulse,
      color: 'text-purple-400',
      description:
        'Infections and complications reducing herd fertility, conception rates, and calf crop yield.',
      diseases: [
        {
          name: 'Metritis & Retained Fetal Membranes',
          species: 'Cattle, Swine, Small Ruminants',
          pathogen: 'Trueperella pyogenes, Fusobacterium necrophorum',
          symptoms: 'Foul-smelling reddish-brown uterine discharge, fever, reduced milk production within 10 days post-calving.',
          traditional: 'Transrectal palpation, vaginoscopy, body temperature monitoring with mercury/digital thermometer.',
          aiModern: 'Smart ear tags with temperature sensors catching the post-calving fever spike 36 hours before systemic shock.',
          biosecurity: 'Calving pen sanitation, clean maternity bedding, prompt veterinary intrauterine or systemic antibiotic therapy.',
        },
      ],
    },
    {
      id: 'zoonotic',
      name: 'Zoonotic Diseases (One Health)',
      icon: AlertOctagon,
      color: 'text-rose-500',
      description:
        'Pathogens capable of transmission from livestock to human farm workers, veterinarians, and consumers.',
      diseases: [
        {
          name: 'Bovine Brucellosis (Bang\'s Disease)',
          species: 'Cattle, Bison, Humans',
          pathogen: 'Brucella abortus (Gram-negative bacterium)',
          symptoms: 'Late-term abortions, retained placenta, orchitis in bulls. In humans: Undulant fever, night sweats, joint pain.',
          traditional: 'Brucella milk ring test (BRT), Rose Bengal plate test, serological ELISA, bacterial culture.',
          aiModern: 'Herd movement traceability algorithms mapping transmission risk across regional sale yards.',
          biosecurity: 'Vaccination of replacement heifers (RB51), PPE during assisted deliveries, mandatory testing of milk herds.',
        },
        {
          name: 'Bovine Spongiform Encephalopathy & Anthrax',
          species: 'Cattle, Sheep, Humans',
          pathogen: 'Bacillus anthracis / Prions',
          symptoms: 'Anthrax: sudden mortality with non-clotting dark blood exuding from natural orifices. Do NOT open carcass.',
          traditional: 'Polychrome methylene blue stained blood smear (M\'Fadyean reaction), PCR.',
          aiModern: 'Immediate carcass geo-fence alert sent to national veterinary surveillance network upon sensor cessation.',
          biosecurity: 'Deep carcass burial with quicklime or complete incineration. Annual spore vaccination in endemic pastures.',
        },
      ],
    },
  ];

  const currentCat = categories.find((c) => c.id === selectedCategory) || categories[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Comprehensive Veterinary Pathology & Diagnostics Reference</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Livestock Disease Taxonomy & Diagnostic Paradigms
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Comparing traditional clinical diagnostics (visual examination, lateral flow, PCR, ELISA, necropsy) with modern AI biosensors and behavioral telemetry.
        </p>

        {/* Category Selector Tabs */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-950'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span className="font-bold text-xs text-white truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-2">
                  {cat.diseases.length} Major Pathogens
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Details */}
      <div className="space-y-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-white text-sm">{currentCat.name}</h3>
            <p className="text-slate-400 mt-0.5">{currentCat.description}</p>
          </div>
          <span className="px-3 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] shrink-0">
            Pathology Category
          </span>
        </div>

        {/* Disease Cards */}
        <div className="space-y-4">
          {currentCat.diseases.map((dis, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{dis.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-semibold">{dis.species}</span>
                    <span>•</span>
                    <span className="italic">{dis.pathogen}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-300">Clinical Signs:</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{dis.symptoms}</p>
              </div>

              {/* Diagnostic Comparison: Traditional vs AI/Modern */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center space-x-2 text-teal-400 font-bold">
                    <Microscope className="w-4 h-4" />
                    <span>Traditional Diagnostic Pipeline</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{dis.traditional}</p>
                </div>

                <div className="bg-slate-950/70 border border-emerald-900/60 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>Modern AI & Sensor Advantage (24-48h Early)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{dis.aiModern}</p>
                </div>
              </div>

              {/* Biosecurity */}
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-400">Biosecurity & Prevention: </span>
                  <span className="text-slate-300">{dis.biosecurity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
