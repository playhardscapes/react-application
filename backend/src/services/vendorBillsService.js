const db = require('../config/database');

const vendorBillsService = {
  async createBill(billData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const billNumber = `BILL-${Date.now()}`;

      // Calculate totals
      const itemsTotal = billData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0);
      const chargesTotal = billData.additionalCharges?.reduce((sum, charge) => 
        sum + Number(charge.amount), 0) || 0;
      const totalAmount = itemsTotal + chargesTotal;

      // Insert bill
      const billQuery = `
        INSERT INTO vendor_bills (
          vendor_id, bill_number, total_amount, issue_date, due_date, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const billResult = await client.query(billQuery, [
        billData.vendorId,
        billNumber,
        totalAmount,
        billData.issueDate,
        billData.dueDate,
        'pending',
        billData.notes || null
      ]);

      const bill = billResult.rows[0];

      // Insert items
      const itemQuery = `
        INSERT INTO vendor_bill_items (
          bill_id, material_id, quantity, unit_price, total_price, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      for (const item of billData.items) {
        await client.query(itemQuery, [
          bill.id,
          item.materialId,
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice,
          item.notes || null
        ]);
      }

      // Insert additional charges
      if (billData.additionalCharges?.length) {
        const chargeQuery = `
          INSERT INTO bill_additional_charges (
            bill_id, type, description, amount, notes
          ) VALUES ($1, $2, $3, $4, $5)
        `;

        for (const charge of billData.additionalCharges) {
          await client.query(chargeQuery, [
            bill.id,
            charge.type,
            charge.description,
            charge.amount,
            charge.notes || null
          ]);
        }
      }

      await client.query('COMMIT');
      return bill;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllBills(filters = {}) {
    let query = `
      SELECT 
        vb.*,
        v.name as vendor_name,
        COUNT(vbi.id) as total_items,
        COALESCE(SUM(vbi.total_price), 0) + COALESCE(
          (SELECT SUM(amount) FROM bill_additional_charges WHERE bill_id = vb.id), 0
        ) as total_amount
      FROM vendor_bills vb
      JOIN vendors v ON vb.vendor_id = v.id
      LEFT JOIN vendor_bill_items vbi ON vb.id = vbi.bill_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND vb.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.vendorId) {
      query += ` AND vb.vendor_id = $${paramCount}`;
      values.push(filters.vendorId);
      paramCount++;
    }

    query += ` GROUP BY vb.id, v.name ORDER BY vb.issue_date DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
    }

    return (await db.query(query, values)).rows;
  },

  async getBillById(id) {
    const billQuery = `
      SELECT 
        vb.*,
        v.name as vendor_name,
        v.email as vendor_email,
        COALESCE(
          (SELECT SUM(total_price) FROM vendor_bill_items WHERE bill_id = vb.id), 0
        ) + COALESCE(
          (SELECT SUM(amount) FROM bill_additional_charges WHERE bill_id = vb.id), 0
        ) as total_amount
      FROM vendor_bills vb
      JOIN vendors v ON vb.vendor_id = v.id
      WHERE vb.id = $1
    `;

    const itemsQuery = `
      SELECT 
        vbi.*,
        m.name as material_name,
        m.sku as material_sku
      FROM vendor_bill_items vbi
      JOIN materials m ON vbi.material_id = m.id
      WHERE vbi.bill_id = $1
    `;

    const chargesQuery = `
      SELECT * FROM bill_additional_charges 
      WHERE bill_id = $1 
      ORDER BY type
    `;

    const [billResult, itemsResult, chargesResult] = await Promise.all([
      db.query(billQuery, [id]),
      db.query(itemsQuery, [id]),
      db.query(chargesQuery, [id])
    ]);

    if (billResult.rows.length === 0) return null;

    const bill = billResult.rows[0];
    bill.items = itemsResult.rows;
    bill.additional_charges = chargesResult.rows;

    return bill;
  },

  async markBillAsPaid(id) {
    const query = `
      UPDATE vendor_bills
      SET 
        status = 'paid',
        paid_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id]);
    if (result.rows.length === 0) throw new Error('Vendor bill not found');
    return result.rows[0];
  },

  async getUpcomingBills(daysBefore = 7) {
    const query = `
      SELECT 
        vb.*,
        v.name as vendor_name,
        v.email as vendor_contact,
        COALESCE(
          (SELECT SUM(total_price) FROM vendor_bill_items WHERE bill_id = vb.id), 0
        ) + COALESCE(
          (SELECT SUM(amount) FROM bill_additional_charges WHERE bill_id = vb.id), 0
        ) as total_amount
      FROM vendor_bills vb
      JOIN vendors v ON vb.vendor_id = v.id
      WHERE 
        vb.status = 'pending' AND 
        vb.due_date <= CURRENT_DATE + interval '${daysBefore} days'
      ORDER BY vb.due_date ASC
    `;

    return (await db.query(query)).rows;
  }
};

module.exports = vendorBillsService;