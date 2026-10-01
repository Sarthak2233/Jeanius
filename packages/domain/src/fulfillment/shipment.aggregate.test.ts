import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Shipment } from './shipment.aggregate.js';
import { ShipmentPackage } from './shipment-package.entity.js';
import { ExportDeclaration } from './export-declaration.vo.js';
import { Address } from '../common/address.vo.js';
import { Money } from '../common/money.vo.js';
import { createEntityId } from '../common/entity-id.js';
import { DomainError } from '../errors/index.js';

describe('Shipment Aggregate & Split Fulfillment', () => {
  const dummyAddress = new Address({
    fullName: 'David Bowie',
    addressLine1: 'Heddon Street 23',
    city: 'London',
    postalCode: 'W1B 4BQ',
    country: 'GB',
    phone: '+44-20-7946-0912',
  });

  const exportDecl = new ExportDeclaration({
    description: "Men's handmade raw denim trousers (100% Cotton)",
    netWeightKg: 0.85,
    grossWeightKg: 1.1,
    invoiceValue: new Money(28000, 'USD'),
    exporterPan: 'NP-104928371',
  });

  it('handles multi-package split fulfillment with independent dispatch', () => {
    const shipment = new Shipment({
      id: createEntityId('ship-001'),
      orderId: createEntityId('ord-mixed-001'),
      shippingAddress: dummyAddress,
    });

    assert.equal(shipment.status, 'PENDING');
    assert.equal(shipment.packages.length, 0);

    // Package 1: Ready-to-wear DROP accessory (dispatched immediately)
    const pkg1 = new ShipmentPackage({
      id: createEntityId('pkg-001'),
      shipmentId: shipment.id,
      packageNumber: 1,
      carrier: 'DHL_EXPRESS',
      orderLineIds: [createEntityId('line-drop-bandana')],
    });

    // Package 2: OM Raw Jeans (dispatched 3 weeks later after tailoring)
    const pkg2 = new ShipmentPackage({
      id: createEntityId('pkg-002'),
      shipmentId: shipment.id,
      packageNumber: 2,
      carrier: 'DHL_EXPRESS',
      orderLineIds: [createEntityId('line-om-jeans')],
      exportDeclaration: exportDecl,
    });

    shipment.addPackage(pkg1);
    shipment.addPackage(pkg2);

    assert.equal(shipment.packages.length, 2);
    assert.equal(shipment.allPackagesDelivered(), false);

    // Dispatch Package 1
    pkg1.dispatch('DHL-TRACK-991188');
    assert.equal(pkg1.status, 'DISPATCHED');
    assert.equal(pkg1.trackingNumber, 'DHL-TRACK-991188');
    assert.equal(pkg2.status, 'PACKED'); // Package 2 is still awaiting tailoring

    // Deliver Package 1
    pkg1.markDelivered();
    assert.equal(pkg1.status, 'DELIVERED');
    assert.equal(shipment.allPackagesDelivered(), false);

    // Later: Dispatch and deliver Package 2
    pkg2.dispatch('DHL-TRACK-991189');
    pkg2.markDelivered();
    assert.equal(pkg2.status, 'DELIVERED');
    assert.equal(shipment.allPackagesDelivered(), true);
  });

  it('validates Nepal export customs declaration rules', () => {
    assert.equal(exportDecl.hsCode, '6203.42.0000');
    assert.equal(exportDecl.countryOfOrigin, 'NP');
    assert.equal(exportDecl.netWeightKg, 0.85);

    // Gross weight must be >= net weight
    assert.throws(
      () =>
        new ExportDeclaration({
          description: 'Defective weight declaration',
          netWeightKg: 2.0,
          grossWeightKg: 1.5, // Invalid: gross < net
          invoiceValue: new Money(10000, 'USD'),
        }),
      DomainError,
    );
  });
});
