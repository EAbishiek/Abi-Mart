import React, { useState } from 'react';
import { Cpu, Play, CheckCircle, AlertTriangle, ArrowRight, Code, Shield } from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  url: string;
  description: string;
  defaultPayload?: any;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'health',
    name: '1. Health Check (Observability)',
    method: 'GET',
    url: '/api/v1/health',
    description: 'Verifies server and database connectivity via trivial SELECT 1 query.',
  },
  {
    id: 'register',
    name: '2. Register User (Requirement F1)',
    method: 'POST',
    url: '/api/v1/auth/register',
    description: 'Public signup for BUYER or SELLER role with bcrypt salted password hashing.',
    defaultPayload: {
      name: 'Test Pro Gamer',
      email: 'gamer@abimart.com',
      password: 'gamerpassword123',
      confirmPassword: 'gamerpassword123',
      role: 'BUYER',
    },
  },
  {
    id: 'login',
    name: '3. Login User (Requirement F1)',
    method: 'POST',
    url: '/api/v1/auth/login',
    description: 'Authenticates credentials, issues HTTP-only cookie & JWT session token.',
    defaultPayload: {
      email: 'buyer@abimart.com',
      password: 'buyer123',
    },
  },
  {
    id: 'me',
    name: '4. Session Check (AuthFilter)',
    method: 'GET',
    url: '/api/v1/auth/me',
    description: 'Validates cookie session token and returns UserResponseDto without password_hash.',
  },
  {
    id: 'products',
    name: '5. Product Catalog (Gaming Gear)',
    method: 'GET',
    url: '/api/v1/products',
    description: 'Queries products table with category, brand, stock, and price filters.',
  },
  {
    id: 'product-reviews',
    name: '6. Product Reviews',
    method: 'GET',
    url: '/api/v1/products/1/reviews',
    description: 'Fetches verified customer reviews and ratings for a gaming peripheral.',
  },
  {
    id: 'cart',
    name: '7. Shopping Cart (Persistent DB)',
    method: 'GET',
    url: '/api/v1/cart',
    description: 'Fetches active user cart items with joined product specifications.',
  },
  {
    id: 'add-cart',
    name: '8. Add Item to Cart',
    method: 'POST',
    url: '/api/v1/cart/items',
    description: 'Persists gaming accessory item into cart_items table in SQLite.',
    defaultPayload: {
      productId: 1,
      quantity: 1,
    },
  },
  {
    id: 'checkout',
    name: '9. Express Gamer Checkout',
    method: 'POST',
    url: '/api/v1/orders/checkout',
    description: 'Atomic transaction creating order, deducting inventory, and clearing cart.',
    defaultPayload: {
      shippingAddress: {
        fullName: 'Alex Mercer',
        phone: '9876543210',
        street: '42 Esports Cyber Arena',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
      paymentMethod: 'CARD',
      discountCents: 0,
      directItems: [{ productId: 1, quantity: 1 }],
    },
  },
  {
    id: 'orders',
    name: '10. Order Tracking & History',
    method: 'GET',
    url: '/api/v1/orders',
    description: 'Retrieves itemized order history with logistics tracking numbers and stages.',
  },
  {
    id: 'users',
    name: '11. List All Users (Admin API)',
    method: 'GET',
    url: '/api/v1/users',
    description: 'Queries database users table returning all user records formatted as DTOs.',
  },
];

export const ApiContractViewer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(ENDPOINTS[0].defaultPayload || {}, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseJson, setResponseJson] = useState<any>(null);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setPayloadText(JSON.stringify(ep.defaultPayload || {}, null, 2));
    setResponseStatus(null);
    setResponseJson(null);
  };

  const executeApiCall = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseJson(null);

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (selectedEndpoint.method === 'POST') {
        try {
          options.body = JSON.stringify(JSON.parse(payloadText));
        } catch {
          setResponseStatus(400);
          setResponseJson({
            success: false,
            data: null,
            error: {
              code: 'MALFORMED_JSON',
              message: 'Invalid JSON request payload in test bench editor.',
            },
          });
          setLoading(false);
          return;
        }
      }

      const res = await fetch(selectedEndpoint.url, options);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseJson(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson({
        success: false,
        data: null,
        error: {
          code: 'FETCH_ERROR',
          message: err.message || 'Failed to reach API endpoint.',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold tracking-tight">API Contract Standards Test Bench</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Demonstrates fixed JSON envelope response contract: <code className="text-indigo-300 font-mono">&#123; success: boolean, data: object, error: object &#125;</code> (Capstone Section 11).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Endpoint Selector Sidebar */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2 block">
            API Endpoints (/api/v1/...)
          </label>
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              onClick={() => handleSelectEndpoint(ep)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                selectedEndpoint.id === ep.id
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="font-bold">{ep.name}</div>
                <div
                  className={`text-[10px] font-mono mt-0.5 ${
                    selectedEndpoint.id === ep.id ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  <span
                    className={`font-bold mr-1 ${
                      ep.method === 'POST' ? 'text-purple-400' : 'text-emerald-400'
                    }`}
                  >
                    {ep.method}
                  </span>
                  {ep.url}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          ))}
        </div>

        {/* Request & Response Inspector */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            {/* Endpoint Title */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded mr-2 ${
                    selectedEndpoint.method === 'POST'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedEndpoint.url}
                </span>
                <p className="text-xs text-slate-500 mt-1">{selectedEndpoint.description}</p>
              </div>

              <button
                onClick={executeApiCall}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute API Call</span>
              </button>
            </div>

            {/* Request Payload Editor for POST */}
            {selectedEndpoint.method === 'POST' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  JSON Request Body Payload
                </label>
                <textarea
                  rows={5}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Response JSON Display */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Server Response Envelope</span>
                </label>

                {responseStatus && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto min-h-[160px] border border-slate-800">
                {loading ? (
                  <span className="text-slate-400 animate-pulse">
                    Sending HTTP request to Express server...
                  </span>
                ) : responseJson ? (
                  <pre>{JSON.stringify(responseJson, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500">
                    Click "Execute API Call" above to test endpoint execution.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
