import React, { useEffect, useState } from 'react';
import { TableInfo, MigrationInfo, UserResponseDto } from '../types';
import { Database, Table, Layers, FileCode, Users, RefreshCw, CheckCircle2, Shield, Key } from 'lucide-react';

export const DatabaseInspector: React.FC = () => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [migrations, setMigrations] = useState<MigrationInfo[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'tables' | 'migrations'>('users');
  const [selectedTable, setSelectedTable] = useState<string>('users');

  const fetchDbInfo = async () => {
    setLoading(true);
    try {
      const [inspRes, usersRes] = await Promise.all([
        fetch('/api/v1/db/inspector'),
        fetch('/api/v1/users'),
      ]);

      const inspJson = await inspRes.json();
      const usersJson = await usersRes.json();

      if (inspJson.success) {
        setTables(inspJson.data.tables || []);
        setMigrations(inspJson.data.migrations || []);
      }

      if (usersJson.success) {
        setUsers(usersJson.data.users || []);
      }
    } catch (err) {
      console.error('Failed to inspect database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const currentTable = tables.find(t => t.name === selectedTable) || tables[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">SQLite Database Inspector</h2>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Status: UP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live inspect SQL tables, schema migrations (`V1__init_schema.sql`), and persisted user accounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDbInfo}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>

          <button
            onClick={async () => {
              if (!confirm('Re-seed database with latest gaming gear catalog and accounts?')) return;
              try {
                await fetch('/api/v1/db/reset', { method: 'POST' });
                fetchDbInfo();
              } catch (e) {
                console.error(e);
              }
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-Seed Database</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users Table ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tables')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'tables'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Schema Tables ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('migrations')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'migrations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Applied Migrations ({migrations.length})</span>
        </button>
      </div>

      {/* Tab 1: Users Table Viewer */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Persisted `users` Table Records</h3>
              <p className="text-xs text-slate-500">
                SQL Query: <code className="font-mono bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">SELECT id, name, email, role, created_at FROM users</code>
              </p>
            </div>
            <span className="text-xs text-slate-600 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              Total Rows: {users.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Password Hashing</th>
                  <th className="p-3">Created Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-600">#{u.id}</td>
                    <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : u.role === 'SELLER'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center space-x-1 font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Key className="w-3 h-3 text-emerald-600" />
                        <span>bcrypt/argon2 $2a$10$...</span>
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{u.created_at || 'Just Now'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Schema Tables Explorer */}
      {activeSubTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Table Selector Sidebar */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2 block">
              Database Tables
            </label>
            {tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTable(t.name)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  selectedTable === t.name
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Table className="w-3.5 h-3.5" />
                  <span>{t.name}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedTable === t.name ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.rowCount} rows
                </span>
              </button>
            ))}
          </div>

          {/* Selected Table Columns Schema */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {currentTable ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-mono">
                      Table: {currentTable.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      PRAGMA table_info("{currentTable.name}")
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-semibold">
                    {currentTable.columns.length} Columns
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Column Name</th>
                        <th className="p-2.5">Data Type</th>
                        <th className="p-2.5">Constraints</th>
                        <th className="p-2.5">Key Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                      {currentTable.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-indigo-950">{col.name}</td>
                          <td className="p-2.5 text-indigo-600">{col.type}</td>
                          <td className="p-2.5 text-slate-600">
                            {col.notnull ? 'NOT NULL' : 'NULLABLE'}
                          </td>
                          <td className="p-2.5">
                            {col.pk ? (
                              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                PRIMARY KEY
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a table to inspect columns.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Applied Migrations History */}
      {activeSubTab === 'migrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Migration Runner Tracking History</h3>
              <p className="text-xs text-slate-500">
                Executed by <code className="font-mono bg-slate-100 px-1 rounded">MigrationService</code> on server process startup from <code className="font-mono bg-slate-100 px-1 rounded">db/migrations/*.sql</code>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {migrations.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold font-mono text-xs text-emerald-950">{m.name}</p>
                    <p className="text-[11px] text-emerald-800">Applied successfully into schema_migrations tracking table</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                    Migration ID #{m.id}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{m.applied_at || 'Startup'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
