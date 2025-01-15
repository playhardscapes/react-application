 
// src/utils/pricingTransform.js

/**
 * Transform the database pricing format into the format expected by the hooks
 */
export const transformPricingData = (pricingRecords) => {
  const transformed = {
    materials: {},
    equipment: {
      posts: {},
      basketball: {
        systems: {},
        extensions: {}
      },
      windscreen: {},
      installation: {}
    },
    services: {}
  };

  pricingRecords.forEach(record => {
    const { name, category, value, unit } = record;
    const categories = category.split('/');

    switch (categories[0]) {
      case 'materials':
        transformed.materials[name] = value;
        break;

      case 'equipment':
        switch (categories[1]) {
          case 'posts':
            transformed.equipment.posts[name] = {
              price: value,
              installationTime: parseFloat(record.description?.match(/Installation time: (\d+\.?\d*) hours/)?.[1] || 0)
            };
            break;

          case 'basketball':
            if (categories[2] === 'systems') {
              const [type, mount] = name.split(' - ');
              if (!transformed.equipment.basketball.systems[type]) {
                transformed.equipment.basketball.systems[type] = {};
              }
              transformed.equipment.basketball.systems[type][mount] = {
                price: value,
                installationTime: parseFloat(record.description?.match(/Installation time: (\d+\.?\d*) hours/)?.[1] || 0)
              };
            } else if (categories[2] === 'extensions') {
              transformed.equipment.basketball.extensions.pricePerFoot = value;
            }
            break;

          case 'windscreen':
            transformed.equipment.windscreen[name] = {
              price: value,
              installationTime: parseFloat(record.description?.match(/Installation time: (\d+\.?\d*) hours/)?.[1] || 0)
            };
            break;

          case 'installation':
            transformed.equipment.installation[name] = value;
            break;
        }
        break;

      case 'services':
        transformed.services[name] = value;
        break;
    }
  });

  return transformed;
};
