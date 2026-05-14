export const COMMON_ROOMS = [
  ...Array.from({ length: 40 }, (_, index) => String(100 + index)),
  'Other'
];

export const RESIDENT_QUESTIONS = [
  'Is your call light answered in a timely manner',
  'Does the facility make an effort to make it feel homelike? If not, why?',
  'Do you feel the activities meet your interests?',
  'How is the food? Do you feel your food preferences are honored?',
  'Are you offered a night time snack by nursing? (CA State regulation)',
  'How is the room temperature?',
  'Does the facility make an effort to respect your privacy?',
  'Do you feel treated with respect?',
  'Are you involved with making decisions about your care?',
  'Does the staff encourage you to do as much as you can for yourself?',
  'Do you feel comfortable voicing grievances?',
  'Are your problems resolved in a timely manner?',
  'Do you feel safe, free of retaliation and free of abuse?',
  'Is there anything else I can do for you?'
];

export const CHECKLIST_QUESTIONS = [
  'Call light, over-bed light, water and remotes within reach?',
  'Resident clean, presentable, nails cleaned and trimmed, clothes clean?',
  'Residents wearing ID wrist band, name posted on door?',
  'Are all alarms turned off?',
  'Bed in low position? Fall mats in place, if indicated?',
  'Oxygen tubing bagged, not on the floor and smoking sign posted?',
  'Food sealed/dated? (Non perishables may be consumed within 7 days)',
  'Nightstand and drawers clean, organized and items bagged properly?',
  'Equipment, washbasins, and urinal all labeled?',
  'Bed pans and washbasins stored separately?',
  'Nothing on the floor or within 18" of ceiling?',
  'Leg rests bagged, not stored in the wheelchair or on the floor?',
  'Closets clean and organized?',
  'No linens on table or chairs?',
  'No briefs in trash?',
  'No aerosol spray cans in resident room?',
  'Bathroom clean and fully stocked including gloves?',
  'Hair brushes and toothbrushes in separate zip lock bags?',
  'Window blinds open for sunlight?',
  'Room clean and smell nice?',
  'Any medications in room?',
  'Foley bag covered?'
];

export const ROUND_ITEMS = [
  ...RESIDENT_QUESTIONS.map((question) => ({ section: 'Resident question', question })),
  ...CHECKLIST_QUESTIONS.map((question) => ({ section: 'Checklist', question }))
];
