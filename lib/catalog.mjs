export const product = { id: 'lenjerie-6-piese', name: 'Lenjerie de pat · 6 piese', amount: 16900, currency: 'ron' };
// Stable variant IDs match the original numbered supplier photographs.
export const colors = [{'id': 'v01', 'name': 'Nuanța 01', 'hex': '#edd1d0', 'image': '/products/1.jpg'}, {'id': 'v02', 'name': 'Nuanța 02', 'hex': '#9c8d88', 'image': '/products/2.jpg'}, {'id': 'v03', 'name': 'Nuanța 03', 'hex': '#4c1624', 'image': '/products/3.jpg'}, {'id': 'v04', 'name': 'Nuanța 04', 'hex': '#c2b3ae', 'image': '/products/4.jpg'}, {'id': 'v05', 'name': 'Nuanța 05', 'hex': '#927f7b', 'image': '/products/5.jpg'}, {'id': 'v06', 'name': 'Nuanța 06', 'hex': '#6d6769', 'image': '/products/6.jpg'}, {'id': 'v07', 'name': 'Nuanța 07', 'hex': '#326755', 'image': '/products/7.jpg'}, {'id': 'v08', 'name': 'Nuanța 08', 'hex': '#257373', 'image': '/products/8.jpg'}, {'id': 'v09', 'name': 'Nuanța 09', 'hex': '#dcb6c3', 'image': '/products/9.jpg'}, {'id': 'v10', 'name': 'Nuanța 10', 'hex': '#98979d', 'image': '/products/10.jpg'}, {'id': 'v11', 'name': 'Nuanța 11', 'hex': '#da9a8e', 'image': '/products/11.jpg'}, {'id': 'v12', 'name': 'Nuanța 12', 'hex': '#8eb6ad', 'image': '/products/12.jpg'}, {'id': 'v13', 'name': 'Nuanța 13', 'hex': '#4890a6', 'image': '/products/13.jpg'}, {'id': 'v14', 'name': 'Nuanța 14', 'hex': '#688279', 'image': '/products/14.jpg'}, {'id': 'v15', 'name': 'Nuanța 15', 'hex': '#ece0c6', 'image': '/products/15.jpg'}, {'id': 'v16', 'name': 'Nuanța 16', 'hex': '#026f74', 'image': '/products/16.jpg'}, {'id': 'v17', 'name': 'Nuanța 17', 'hex': '#08070d', 'image': '/products/17.jpg'}, {'id': 'v18', 'name': 'Nuanța 18', 'hex': '#f0f0f0', 'image': '/products/18.jpg'}, {'id': 'v19', 'name': 'Nuanța 19', 'hex': '#595c61', 'image': '/products/19.jpg'}];
export function validateSelection(input) {
 if (!input || !colors.some(c=>c.id===input.color) || !Number.isInteger(input.quantity) || input.quantity<1 || input.quantity>5) return null;
 return {color:input.color,quantity:input.quantity};
}
export function activeDeadline(value, now=Date.now()) {
 const end = Date.parse(value || '');
 return Number.isFinite(end) && end>now ? end : null;
}
