// src/services/contractService.js
const db = require('../config/database');

const COMPANY_INFO = {
  name: 'MOSFCO, LLC',
  dba: 'Play Hardscapes',
  address: '506 Ray Street, Roanoke, VA 24019',
  phone: '540-384-4854',
  email: 'patrick@playhardscapes.com',
  website: 'https://www.playhardscapes.com',
  license: '2705174068'
};

const contractService = {
  async getAllContracts() {
    const query = `
      SELECT 
        c.*,
        p.title as proposal_title,
        cl.name as client_name,
        cl.email as client_email
      FROM contracts c
      LEFT JOIN proposals p ON c.proposal_id = p.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.created_at DESC
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  async getContractById(id) {
    const query = `
      SELECT 
        c.*,
        p.title as proposal_title,
        p.content as proposal_content,
        cl.name as client_name,
        cl.email as client_email,
        cl.phone as client_phone,
        e.project_location,
        e.total_amount as estimate_amount
      FROM contracts c
      LEFT JOIN proposals p ON c.proposal_id = p.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN estimates e ON p.estimate_id = e.id
      WHERE c.id = $1
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  },

  async generateContract(proposalData) {
    try {
      console.log('Generating contract with proposal data:', proposalData);
      
      const contractContent = `
        <div class="contract">
          ${this.generateHeader(proposalData)}
          ${this.generateProjectDetails(proposalData)}
          ${this.generateScopeOfWork(proposalData)}
          ${this.generateTimeline(proposalData)}
          ${this.generateFinancialTerms(proposalData)}
          ${this.generateStandardClauses()}
          ${this.generateSignatures()}
        </div>
      `;

      const result = await this.createContract({
        proposal_id: proposalData.id,
        client_id: proposalData.client_id,
        content: contractContent,
        status: 'draft',
        contract_amount: proposalData.total_amount
      });

      return {
        id: result.id,
        content: contractContent
      };
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  },

  async createContract(contractData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO contracts (
          proposal_id,
          client_id,
          content,
          status,
          start_date,
          completion_date,
          contract_amount,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        contractData.proposal_id,
        contractData.client_id,
        contractData.content,
        contractData.status || 'draft',
        contractData.start_date,
        contractData.completion_date,
        contractData.contract_amount
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating contract:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateContract(id, contractData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      let updateFields = [];
      let values = [];
      let valueIndex = 1;

      if (contractData.content !== undefined) {
        updateFields.push(`content = $${valueIndex}`);
        values.push(contractData.content);
        valueIndex++;
      }

      if (contractData.status !== undefined) {
        updateFields.push(`status = $${valueIndex}`);
        values.push(contractData.status);
        valueIndex++;
      }

      if (contractData.start_date !== undefined) {
        updateFields.push(`start_date = $${valueIndex}`);
        values.push(contractData.start_date);
        valueIndex++;
      }

      if (contractData.completion_date !== undefined) {
        updateFields.push(`completion_date = $${valueIndex}`);
        values.push(contractData.completion_date);
        valueIndex++;
      }

      if (contractData.contract_amount !== undefined) {
        updateFields.push(`contract_amount = $${valueIndex}`);
        values.push(contractData.contract_amount);
        valueIndex++;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `
        UPDATE contracts
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating contract:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  generateHeader(data) {
    return `
      <div class="header">
        <h1>Play Hardscapes Contract – Revised ${new Date().toLocaleDateString()}</h1>
        <div class="contact-info">
          <div class="company-info">
            <h2>Play Hardscapes Contact Information:</h2>
            <p>Company Name: ${COMPANY_INFO.name}</p>
            <p>DBA: ${COMPANY_INFO.dba}</p>
            <p>Address: ${COMPANY_INFO.address}</p>
            <p>Phone: ${COMPANY_INFO.phone}</p>
            <p>Email: ${COMPANY_INFO.email}</p>
            <p>Website: ${COMPANY_INFO.website}</p>
            <p>License Number: ${COMPANY_INFO.license}</p>
          </div>
          <div class="client-info">
            <h2>Client Information:</h2>
            <p>Name: ${data.client_name || ''}</p>
            <p>Email: ${data.client_email || ''}</p>
            <p>Phone: ${data.client_phone || ''}</p>
            <p>Location: ${data.project_location || ''}</p>
          </div>
        </div>
      </div>
    `;
  },

  generateProjectDetails(data) {
    return `
      <div class="project-details">
        <h2>Project Details:</h2>
        <p>Project Name: ${data.title || 'N/A'}</p>
        <p>Location: ${data.project_location || 'TBD'}</p>
        <p>Total Contract Amount: $${Number(data.total_amount).toLocaleString() || '0'}</p>
      </div>
    `;
  },

  generateScopeOfWork(data) {
    return `
      <div class="scope-of-work">
        <h2>Scope of Work</h2>
        ${data.content || ''}
      </div>
    `;
  },

  generateTimeline(data) {
    return `
      <div class="project-timeline">
        <h2>Project Timeline:</h2>
        <p>Start Date: ${data.start_date ? new Date(data.start_date).toLocaleDateString() : 'TBD'}</p>
        <p>Completion Date: ${data.completion_date ? new Date(data.completion_date).toLocaleDateString() : 'TBD'}</p>
        <p>Weather may affect completion date. Materials will be applied based on the manufacturers' recommendations.</p>
      </div>
    `;
  },

  generateFinancialTerms(data) {
    const amount = Number(data.total_amount || 0);
    return `
      <div class="financial-terms">
        <h2>Financial Terms:</h2>
        <p>Total Contract Price: $${amount.toLocaleString()}</p>
        <h3>Payment Schedule:</h3>
        <p>$${(amount * 0.5).toLocaleString()} due upon completion of first court.</p>
        <p>$${(amount * 0.5).toLocaleString()} upon final completion and client satisfaction.</p>
      </div>
    `;
  },

  generateStandardClauses() {
    return `
      <div class="standard-clauses">
        <h2>Materials and Workmanship</h2>
        <h3>Installation Standards and Compliance with Manufacturer Specifications</h3>
        <p>The Contractor, Play Hardscapes, hereby agrees to perform the installation of all materials and products in strict adherence to the standards and specifications set forth by the manufacturer. We commit to ensuring that each aspect of our installation process complies with the highest industry standards, guaranteeing that the functionality and performance of the installed materials meet or exceed the requirements intended by the manufacturer.</p>

        <h3>Manufacturer's Responsibility and Regulatory Standards</h3>
        <p>It is the responsibility of the manufacturer to establish specifications that align with the International Tennis Federation (ITF) Standards for Tennis Courts, as well as other relevant standards set forth by recognized athletic organizations. These specifications are meticulously designed to ensure the safety, quality, and performance of the sports surfaces.</p>

        <h3>Clause for Coatings on Existing Asphalt Surfaces</h3>
        <p>The Client acknowledges that the materials applied by the Contractor, including but not limited to coatings and finishes, are non-structural and intended solely for surface enhancement. The effectiveness and longevity of such applications are contingent upon the condition of the underlying asphalt substrate, over which the Contractor has no control once the initial surface preparation is completed.</p>

        <h3>Subsurface Condition Acknowledgment</h3>
        <p>The Client acknowledges that the materials applied by the Contractor, including but not limited to coatings and finishes, are non-structural and intended solely for surface enhancement. The effectiveness and longevity of such applications are contingent upon the condition of the underlying asphalt substrate, over which the Contractor has no control once the initial surface preparation is completed.</p>

        <h3>Exclusions of Warranty</h3>
        <ol>
          <li>Subsurface Failures: The Contractor shall not be responsible for any defects, failures, or damages resulting from the underlying asphalt's condition, including but not limited to cracking, spalling, moisture issues, or subsurface movement.</li>
          <li>No Warranty for Subsurface Conditions: The Contractor expressly excludes any warranty, implied or explicit, related to the prevention of subsurface-induced issues.</li>
        </ol>

        <h3>Client's Responsibilities</h3>
        <ol>
          <li>Future Repairs and Costs: Should the underlying asphalt fail or exhibit defects post-application of the specified materials, the Client will be solely responsible for the costs associated with any necessary repairs.</li>
          <li>Notification of Known Defects: The Client is responsible for informing the Contractor of any known defects, issues, or history of repairs related to the existing asphalt.</li>
        </ol>

        <h3>Texture Specification and Client-Requested Adjustments</h3>
        <p>The Contractor agrees to install the surface material for athletic courts (tennis, pickleball, basketball) in strict accordance with the manufacturer's specifications, ensuring that the standard texture finish meets industry-accepted norms for playability and safety. The texture of the court surface is critical to the performance characteristics of the court and will be applied to achieve the optimal balance of traction and smoothness as per the manufacturer's guidelines.</p>

        <h3>Warranty</h3>
        <p>Contractor's Craftsmanship and Workmanship Warranty: Play Hardscapes hereby warrants to the Client that all craftsmanship and workmanship provided under this contract shall be performed in a professional, workmanlike manner, adhering to standard practices prevalent in the industry. Play Hardscapes agrees to correct, at no additional cost to the Client, any defects due to faulty workmanship or materials manifested within one (1) year from the date of project completion.</p>
        <p>This warranty does not cover:</p>
        <ul>
          <li>Normal wear and tear</li>
          <li>Damage resulting from negligence, improper maintenance, modifications, or repairs by anyone other than Play Hardscapes</li>
          <li>Damage from accidents, including but not limited to acts of God, impacts, fires, or water damage</li>
        </ul>

        <h3>Insurance and Liability Information</h3>
        <p>Insured: MOSFCO, LLC</p>
        <p>Company: Auto Owners Insurance Company</p>
        <p>Agency: Eades & Lower</p>
        <p>Policy Number: 242345-43104933-24</p>
        <p>Expiration: 02-28-2025 12:01 a.m.</p>
      </div>
    `;
  },

  generateSignatures() {
    return `
      <div class="signatures">
        <h2>Signatures:</h2>
        <p>The undersigned parties hereby agree to the terms and conditions of this contract and commit to fulfill their respective obligations as outlined herein.</p>
        <div class="signature-blocks">
          <div class="client-signature">
            <p>Authorized Signature:</p>
            <div class="signature-line">____________________</div>
            <p>Date: _____________</p>
          </div>
          <div class="contractor-signature">
            <p>Play Hardscapes Authorized Representative:</p>
            <div class="signature-line">____________________</div>
            <p>Date: _____________</p>
          </div>
        </div>
      </div>
    `;
  },

async deleteContract(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Delete the contract
    const result = await client.query(
      'DELETE FROM contracts WHERE id = $1 RETURNING id',
      [id]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting contract:', error);
    throw error;
  } finally {
    client.release();
  } 
}

};


module.exports = contractService;