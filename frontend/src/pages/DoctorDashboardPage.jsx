import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

import Dashboard from '../components/doctor/Dashboard';
import DoctorProfile from '../components/doctor/DoctorProfile';
import DoctorProfileSection from '../components/doctor/DoctorProfileSection';

const DoctorDashboardPage = () => {
	const { link } = useParams();

	useEffect(() => {
		const fetchDoctor = async () => {
			try {
				// Find doctor by uniqueAccessLink
				const res = await api.get(`/doctors?uniqueAccessLink=${link}`);
				if (res.data && res.data.length > 0) {
					const doctor = res.data[0];
					sessionStorage.setItem('doctor', JSON.stringify(doctor));
				} else {
					console.error('❌ No doctor found for link:', link);
				}
			} catch (err) {
				console.error('❌ Error fetching doctor:', err);
			}
		};
		if (link) fetchDoctor();
	}, [link]);

			return (
				<>
					<Dashboard />
				</>
			);
};

export default DoctorDashboardPage;
