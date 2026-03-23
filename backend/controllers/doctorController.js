const Doctor = require('../models/Doctor');

async function listDoctors(req, res) {
  try {
    const doctors = await Doctor.listApproved();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
}

async function getDoctor(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
}

async function createDoctor(req, res) {
  try {
    const documents = {};
    if (req.files) {
      Object.entries(req.files).forEach(([key, value]) => {
        if (value?.[0]?.path) {
          documents[key] = value[0].path;
        }
      });
    }

    const doctor = await Doctor.createApplication({
      ...req.body,
      documents
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      doctor
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor profile' });
  }
}

async function updateDoctor(req, res) {
  try {
    const doctor = await Doctor.updateById(req.params.id, req.body);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
}

async function updateBanking(req, res) {
  try {
    const { bankDetails } = req.body;
    if (!bankDetails?.accountHolderName || !bankDetails?.accountNumber || !bankDetails?.ifscCode || !bankDetails?.bankName) {
      return res.status(400).json({ error: 'All banking fields are required' });
    }

    const doctor = await Doctor.updateBanking(req.params.id, bankDetails);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({
      message: 'Banking details updated successfully',
      bankDetails: doctor.bankDetails
    });
  } catch (error) {
    console.error('Error updating banking details:', error);
    res.status(500).json({ error: 'Failed to update banking details' });
  }
}

async function pendingDoctors(req, res) {
  try {
    const doctors = await Doctor.listPending();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching pending doctors:', error);
    res.status(500).json({ message: 'Failed to fetch pending doctors' });
  }
}

async function approveDoctor(req, res) {
  try {
    const doctor = await Doctor.approve(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({
      message: 'Doctor approved successfully',
      doctor,
      accessLink: doctor.uniqueAccessLink
    });
  } catch (error) {
    console.error('Error approving doctor:', error);
    res.status(500).json({ message: 'Failed to approve doctor' });
  }
}

async function rejectDoctor(req, res) {
  try {
    const doctor = await Doctor.reject(req.params.id, req.body.reason);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({
      message: 'Doctor application rejected',
      doctor
    });
  } catch (error) {
    console.error('Error rejecting doctor:', error);
    res.status(500).json({ message: 'Failed to reject doctor application' });
  }
}

async function deleteDoctor(req, res) {
  try {
    const doctor = await Doctor.remove(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({
      message: 'Doctor deleted successfully',
      doctor
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
}

module.exports = {
  listDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  updateBanking,
  pendingDoctors,
  approveDoctor,
  rejectDoctor,
  deleteDoctor
};
