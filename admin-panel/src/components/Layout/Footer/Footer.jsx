import React from 'react';
import './Footer.css';

function Footer() {
	return (
		<footer>
			<div className='has-text-centered'>
				<p>&copy; {new Date().getFullYear()} Adid's Shop</p>
			</div>
		</footer>
	);
}

export default Footer;
