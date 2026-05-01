import { handleCheckout } from '../actions/checkout';

export default function StorePage() {
  const tickets = [
    { name: 'LARP Admission', priceId: 'price_1TSJcrIwzBgGm4Tdfjlj1MEZ', price: '$25' }
  ];

  return (
    <div className="p-10 bg-black min-h-screen text-red-600">
      <h1 className="text-4xl mb-8 font-serif uppercase tracking-widest">Tickets</h1>
      <div className="grid gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.priceId} className="border-2 border-red-900 p-6 rounded-lg bg-zinc-900">
            <h2 className="text-2xl font-bold">{ticket.name}</h2>
            <p className="text-xl mb-4">{ticket.price}</p>
            
            {/* Using a Form Action - the "Lazy" way to handle clicks */}
            <form action={handleCheckout.bind(null, ticket.priceId)}>
              <button type="submit" className="w-full py-3 bg-red-700 text-white font-bold hover:bg-red-600 transition">
                Purchase Ticket
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}