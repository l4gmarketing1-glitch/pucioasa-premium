import {NextRequest,NextResponse} from 'next/server';
import {stripeClient,storeReady,siteUrl} from '@/lib/store';
import {product,colors,validateSelection} from '@/lib/catalog.mjs';
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==new URL(siteUrl).origin) return NextResponse.json({error:'Cerere neautorizată.'},{status:403});
 if(!storeReady()) return NextResponse.json({error:'Magazinul este în pregătire. Comenzile nu sunt încă active.'},{status:503});
 if(process.env.OFFER_ENDS_AT && Date.parse(process.env.OFFER_ENDS_AT)<=Date.now()) return NextResponse.json({error:'Perioada acestei oferte s-a încheiat.'},{status:409});
 let body;try{body=await req.json();}catch{return NextResponse.json({error:'Cerere invalidă.'},{status:400});}
 const selection=validateSelection(body);if(!selection)return NextResponse.json({error:'Alege o culoare și între 1 și 5 seturi.'},{status:400});
 const color=colors.find(c=>c.id===selection.color)!;
 // Amount, currency and variant labels are always resolved on the server.
 try{const session=await stripeClient().checkout.sessions.create({mode:'payment',locale:'ro',allowed_payment_method_types:['card'],billing_address_collection:'auto',shipping_address_collection:{allowed_countries:['RO']},phone_number_collection:{enabled:true},line_items:[{quantity:selection.quantity,price_data:{currency:product.currency,unit_amount:product.amount,product_data:{name:product.name,description:`Culoare: ${color.name} · 6 piese`,metadata:{product_id:product.id,color:color.id}}}}],shipping_options:[{shipping_rate_data:{type:'fixed_amount',fixed_amount:{amount:0,currency:'ron'},display_name:'Transport gratuit'}}],metadata:{product_id:product.id,color:color.name,quantity:String(selection.quantity)},success_url:`${siteUrl}/comanda/succes?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${siteUrl}/?checkout=cancelled#produs`});return NextResponse.json({url:session.url});}catch{console.error('Checkout session creation failed');return NextResponse.json({error:'Plata nu a putut fi inițiată. Încearcă din nou.'},{status:502});}
}
