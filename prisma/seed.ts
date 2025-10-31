import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
  {
    subject: 'MATH',
    grade: 8,
    key: 'lin_equations_one_var',
    title: 'Linear Equations in One Variable',
    description: 'Solve multi-step linear equations with variables on one/both sides; check solutions.',
  },
  {
    subject: 'MATH',
    grade: 8,
    key: 'systems_by_graphing',
    title: 'Systems by Graphing',
    description: 'Graph two linear equations to locate intersection; interpret as solution pair.',
  },
  {
    subject: 'MATH',
    grade: 8,
    key: 'exponents_scientific',
    title: 'Exponents & Scientific Notation',
    description: 'Operate with powers; convert to/from scientific notation; estimate with powers of 10.',
  },
  {
    subject: 'SCIENCE',
    grade: 8,
    key: 'forces_newton',
    title: "Forces & Newton's Laws",
    description: "Predict motion changes using Newton's laws; free-body ideas and net force.",
  },
  {
    subject: 'SCIENCE',
    grade: 8,
    key: 'waves_properties',
    title: 'Waves: Properties & Interactions',
    description: 'Relate frequency, wavelength, amplitude; absorption/reflection/transmission.',
  },
  {
    subject: 'STEM_FLIGHT_SPACE',
    grade: 8,
    key: 'aero_four_forces',
    title: 'Four Forces of Flight',
    description: 'Lift, weight, thrust, drag; balance determines steady flight; simple design trade-offs.',
  },
  {
    subject: 'STEM_FLIGHT_SPACE',
    grade: 8,
    key: 'rocketry_newton',
    title: "Rocketry & Newton's 3rd",
    description: 'Action-reaction in rockets; mass and exhaust velocity; stability fins & CG/CP.',
  },
  {
    subject: 'STEM_FLIGHT_SPACE',
    grade: 8,
    key: 'orbits_basics',
    title: 'Orbits: Speed & Height',
    description: 'Gravity + sideways speed make orbit; higher orbits move slower; period vs altitude.',
  },
  {
    subject: 'SOCIAL_STUDIES',
    grade: 8,
    key: 'source_claim_evidence',
    title: 'Claim–Evidence–Reasoning (History)',
    description: 'Use primary/secondary sources to form a claim supported by evidence and reasoning.',
  },
  {
    subject: 'SOCIAL_STUDIES',
    grade: 8,
    key: 'civics_rights_responsibilities',
    title: 'Civics: Rights & Responsibilities',
    description: 'Balance individual rights with civic duties; analyze case examples.',
  },
  {
    subject: 'LANGUAGE_ARTS',
    grade: 8,
    key: 'textual_evidence',
    title: 'Textual Evidence',
    description: 'Quote and paraphrase accurately; connect evidence to a clear claim.',
  },
  {
    subject: 'LANGUAGE_ARTS',
    grade: 8,
    key: 'argument_structure',
    title: 'Argument Structure',
    description: 'Thesis, reasons, counterclaim, rebuttal; coherent paragraphs and transitions.',
  },
];

async function main() {
  console.log('Start seeding...');

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { key: skill.key },
      update: {},
      create: skill as any,
    });
  }

  console.log(`Seeded ${skills.length} skills`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
