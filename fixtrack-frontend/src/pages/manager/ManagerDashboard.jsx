import { Box, Typography, Grid, Card, CardContent, Paper } from '@mui/material';
import {
  ConfirmationNumberOutlined,
  PriorityHighOutlined,
  TimerOutlined,
  PeopleOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { tickets, users } from '../../data/mockData';
import AlertCard from '../../components/dashboard/AlertCard';
import KpiCard from '../../components/dashboard/KpiCard';

export default function ManagerDashboard() {
  const { user } = useAuth();

  // ── KPIs ──────────────────────────────────────────────────────
  const ticketsOuverts    = tickets.filter(t => t.statut === 'open' || t.statut === 'assigned').length;
  const ticketsCritiques  = tickets.filter(t => t.priorite === 'critical' && !t.technicienId).length;
  const delaiMoyen        = 4.2;
  const techniciensActifs = users.filter(u => u.role === 'technician').length;

  // ── Bar chart — 1 seul objet, chaque statut = sa propre clé ──
  const ticketParStatut = [
    {
      name: 'Tickets',
      Ouverts:    tickets.filter(t => t.statut === 'open').length,
      Assignés:   tickets.filter(t => t.statut === 'assigned').length,
      'En cours': tickets.filter(t => t.statut === 'in_progress').length,
      Résolus:    tickets.filter(t => t.statut === 'resolved').length,
      Clôturés:   tickets.filter(t => t.statut === 'closed').length,
    },
  ];

  // ── Line chart ────────────────────────────────────────────────
  const evolutionTickets = [
    { jour: 'Lun', tickets: 2 },
    { jour: 'Mar', tickets: 3 },
    { jour: 'Mer', tickets: 1 },
    { jour: 'Jeu', tickets: 4 },
    { jour: 'Ven', tickets: 2 },
    { jour: 'Sam', tickets: 1 },
    { jour: 'Dim', tickets: 0 },
  ];

  // ── Alertes ───────────────────────────────────────────────────
  const alertes = tickets.filter(t => t.priorite === 'critical' && !t.technicienId);

  // ── Performance équipe ────────────────────────────────────────
  const techniciens = users.filter(u => u.role === 'technician');
  const performanceEquipe = techniciens.map(tech => ({
    nom:         tech.nom,
    resolus:     tickets.filter(t => t.technicienId === tech.id && t.statut === 'resolved').length,
    enCours:     tickets.filter(t => t.technicienId === tech.id && t.statut === 'in_progress').length,
    competences: tech.competences?.join(', ') || 'N/A',
  }));

  // ── Greeting ──────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <Box>

      {/* ── Welcome Banner ── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
      }}>
        <Box sx={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <Box sx={{ position: 'absolute', right: 60, bottom: -60, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            📊
          </Box>
          <Box>
            <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              {greeting}, {user?.nom || user?.name || 'Manager'} 👋
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
              Vue d'ensemble de vos activités de maintenance
            </Typography>
          </Box>
        </Box>

        {ticketsCritiques > 0 && (
          <Box sx={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 1, zIndex: 1 }}>
            <WarningAmberOutlined sx={{ color: '#FCA5A5', fontSize: 18 }} />
            <Typography sx={{ color: '#FCA5A5', fontWeight: 700, fontSize: '14px' }}>
              {ticketsCritiques} critique{ticketsCritiques > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── KPI Cards ── */}
      <Grid container spacing={3} sx={{ marginBottom: '28px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={ConfirmationNumberOutlined} value={ticketsOuverts}   label="Tickets ouverts"        color="#2563EB" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={PriorityHighOutlined}       value={ticketsCritiques} label="Tickets critiques"      color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={TimerOutlined}              value={`${delaiMoyen}h`} label="Délai moyen résolution" color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={PeopleOutlined}             value={techniciensActifs} label="Techniciens actifs"    color="#22C55E" />
        </Grid>
      </Grid>

      {/* ── Charts ── */}
      <Grid container spacing={4} sx={{ marginBottom: '28px' }}>

        {/* BarChart pleine largeur */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)' } }}>
            <CardContent sx={{ padding: '28px !important' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '16px', marginBottom: '24px' }}>
                Tickets par statut
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketParStatut} barSize={60} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis hide />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }} />
                  <Bar dataKey="Ouverts"    fill="#2563EB" radius={[6,6,0,0]} />
                  <Bar dataKey="Assignés"   fill="#3B82F6" radius={[6,6,0,0]} />
                  <Bar dataKey="En cours"   fill="#F59E0B" radius={[6,6,0,0]} />
                  <Bar dataKey="Résolus"    fill="#22C55E" radius={[6,6,0,0]} />
                  <Bar dataKey="Clôturés"   fill="#6B7280" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* LineChart pleine largeur */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)' } }}>
            <CardContent sx={{ padding: '28px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>
                  Évolution sur 7 jours
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpOutlined sx={{ color: '#22C55E', fontSize: 18 }} />
                  <Typography sx={{ color: '#22C55E', fontWeight: 600, fontSize: '13px' }}>+12%</Typography>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={evolutionTickets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="jour" stroke="#9CA3AF" style={{ fontSize: '13px' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="tickets" stroke="#2563EB" strokeWidth={3}
                    dot={{ fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Alertes + Performance ── */}
      <Grid container spacing={3}>

        {/* Alertes */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ padding: '28px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', height: '100%', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: '20px' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WarningAmberOutlined sx={{ color: '#EF4444', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>
                Alertes critiques
              </Typography>
              {alertes.length > 0 && (
                <Box sx={{ background: '#FEE2E2', color: '#EF4444', fontWeight: 700, fontSize: '12px', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {alertes.length}
                </Box>
              )}
            </Box>

            {alertes.length === 0 ? (
              <Box sx={{ textAlign: 'center', padding: '40px 20px' }}>
                <Typography sx={{ fontSize: '32px', marginBottom: '8px' }}>✅</Typography>
                <Typography sx={{ color: '#22C55E', fontWeight: 700, fontSize: '15px' }}>Aucune alerte critique</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>Tous les tickets urgents sont assignés</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {alertes.map(ticket => (
                  <AlertCard key={ticket.id} ticket={ticket} />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Performance Équipe */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ padding: '28px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', height: '100%', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, marginBottom: '20px' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleOutlined sx={{ color: '#2563EB', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>
                Performance de l'équipe
              </Typography>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['Technicien', 'Compétences', 'En cours', 'Résolus'].map(h => (
                      <th key={h} style={{
                        textAlign: h === 'En cours' || h === 'Résolus' ? 'center' : 'left',
                        padding: '12px 16px', color: '#6B7280', fontWeight: 600,
                        fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase',
                        borderBottom: '1px solid #E5E7EB',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {performanceEquipe.map((tech, index) => (
                    <tr key={index}
                      style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: '#111827', fontWeight: 600, fontSize: '14px' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Box style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: `hsl(${index * 60 + 210}, 70%, 50%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0,
                          }}>
                            {tech.nom?.charAt(0)?.toUpperCase() || '?'}
                          </Box>
                          {tech.nom}
                        </Box>
                      </td>
                      <td style={{ padding: '16px', color: '#6B7280', fontSize: '12px', maxWidth: 180 }}>
                        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(tech.competences || '').split(', ').map((c, i) => (
                            <span key={i} style={{ background: '#F3F4F6', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', color: '#374151', fontWeight: 500 }}>
                              {c}
                            </span>
                          ))}
                        </Box>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ background: tech.enCours > 0 ? '#FEF9C3' : '#F3F4F6', color: tech.enCours > 0 ? '#B45309' : '#9CA3AF', padding: '4px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}>
                          {tech.enCours}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ background: tech.resolus > 0 ? '#DCFCE7' : '#F3F4F6', color: tech.resolus > 0 ? '#16A34A' : '#9CA3AF', padding: '4px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}>
                          {tech.resolus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

