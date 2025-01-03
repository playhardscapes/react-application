const MaterialPricing = ({ data, patchWork, pricingConfig = {} }) => {
  // Extract values from pricingConfig with defaults
  const {
    binderPrice = 124.65,
    sandPrice = 11.31,
    cementPrice = 18.00,
    resurfacerPrice = 361.26,
    colorCoatingPrice = 950.00,
    fiberglassMeshPrice = 90.34,
    acidEtchPrice = 76.66,
    linePaintWhite = 142.24,
    linePaintColor = 200.00
  } = pricingConfig;

  const estimatedGallons = patchWork?.estimatedGallons || 0;

  const materials = [
    { name: 'Court Patch Binder', required: Math.ceil(estimatedGallons / 5), unit: 'bucket', price: binderPrice },
    { name: 'Sand', required: Math.ceil(estimatedGallons / 50), unit: 'bag', price: sandPrice },
    { name: 'Cement', required: Math.ceil(estimatedGallons / 50), unit: 'set', price: cementPrice },
    { name: 'Resurfacer', required: Math.ceil(estimatedGallons / 30), unit: 'drum', price: resurfacerPrice },
    { name: 'Color Coating', required: Math.ceil(estimatedGallons / 30), unit: 'drum', price: colorCoatingPrice },
    { name: 'Fiberglass Mesh', required: 1, unit: 'roll', price: fiberglassMeshPrice },
    { name: 'Acid Etch', required: 1, unit: '5-gal', price: acidEtchPrice },
    { name: 'Line Paint (White)', required: 1, unit: '5-gal', price: linePaintWhite },
    { name: 'Line Paint (Color)', required: 1, unit: '5-gal', price: linePaintColor }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Materials</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map((material) => (
          <div key={material.name} className="p-4 border rounded">
            <p className="font-medium">{material.name}</p>
            <p>Quantity: {material.required} {material.unit}s</p>
            <p>Unit Price: ${material.price.toFixed(2)}</p>
            <p>Total: ${(material.required * material.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialPricing;
