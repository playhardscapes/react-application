-- Add columns for storing calculated costs
ALTER TABLE estimates 
ADD COLUMN surface_prep_costs jsonb DEFAULT '{
  "pressure_wash": 0,
  "acid_wash": 0,
  "patch_work": {
    "materials": 0,
    "total": 0
  },
  "fiberglass_mesh": {
    "materials": 0,
    "installation": 0,
    "total": 0
  },
  "cushion_system": {
    "materials": 0,
    "installation": 0,
    "total": 0
  },
  "total": 0
}'::jsonb,

ADD COLUMN coating_costs jsonb DEFAULT '{
  "materials": {
    "resurfacer": {
      "cost": 0,
      "installation": 0
    },
    "color_coat": {
      "cost": 0,
      "installation": 0
    },
    "total": 0
  },
  "installation": {
    "labor": 0,
    "total": 0
  },
  "lining": {
    "materials": 0,
    "labor": 0,
    "total": 0
  },
  "total": 0
}'::jsonb,

ADD COLUMN equipment_costs jsonb DEFAULT '{
  "tennis": {
    "posts": 0,
    "installation": 0,
    "total": 0
  },
  "pickleball": {
    "posts": 0,
    "mobile_nets": 0,
    "installation": 0,
    "total": 0
  },
  "basketball": {
    "systems": 0,
    "installation": 0,
    "total": 0
  },
  "windscreen": {
    "materials": 0,
    "installation": 0,
    "total": 0
  },
  "total": 0
}'::jsonb,

ADD COLUMN logistics_costs jsonb DEFAULT '{
  "labor": {
    "hours": 0,
    "rate": 0,
    "total": 0
  },
  "lodging": {
    "nights": 0,
    "rate": 0,
    "total": 0
  },
  "mileage": {
    "distance": 0,
    "rate": 0,
    "total": 0
  },
  "total": 0
}'::jsonb;