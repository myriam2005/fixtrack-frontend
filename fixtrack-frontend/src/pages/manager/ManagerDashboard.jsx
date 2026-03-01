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
import Badge from '../../components/common/Badge';

export default function ManagerDashboard() {
  const { user } = useAuth();

  const ticketsOuverts    = tickets.filter(t => t.statut === 'open' || t.statut === 'assigned').length;
  const ticketsCritiques  = tickets.filter(t => t.priorite === 'critical' && !t.technicienId).length;
  const delaiMoyen        = 4.2;
  const techniciensActifs = users.filter(u => u.role === 'technician').length;

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

  const evolutionTickets = [
    { jour: 'Lun', tickets: 2 },
    { jour: 'Mar', tickets: 3 },
    { jour: 'Mer', tickets: 1 },
    { jour: 'Jeu', tickets: 4 },
    { jour: 'Ven', tickets: 2 },
    { jour: 'Sam', tickets: 1 },
    { jour: 'Dim', tickets: 0 },
  ];

  const alertes = tickets.filter(t => t.priorite === 'critical' && !t.technicienId);

  const techniciens = users.filter(u => u.role === 'technician');
  const performanceEquipe = techniciens.map(tech => ({
    nom:         tech.nom,
    resolus:     tickets.filter(t => t.technicienId === tech.id && t.statut === 'resolved').length,
    enCours:     tickets.filter(t => t.technicienId === tech.id && t.statut === 'in_progress').length,
    competences: tech.competences?.join(', ') || 'N/A',
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <Box>

      {/* ── Welcome Banner ── */}
      <Box sx={{
        background: 'linear-gradient(120deg, #1E3A5F 0%, #2563EB 100%)',
        borderRadius: '14px',
        padding: '18px 28px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '2px',
          }}>
            {greeting}, {user?.nom || user?.name || 'Manager'}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
            Vue d'ensemble de vos activités de maintenance
          </Typography>
        </Box>

        {ticketsCritiques > 0 && (
          <Box sx={{
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '10px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <WarningAmberOutlined sx={{ color: '#FCA5A5', fontSize: 16 }} />
            <Typography sx={{ color: '#FCA5A5', fontWeight: 700, fontSize: '13px' }}>
              {ticketsCritiques} ticket{ticketsCritiques > 1 ? 's' : ''} critique{ticketsCritiques > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── KPI Cards ── */}
      <Grid container spacing={3} sx={{ marginBottom: '28px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={ConfirmationNumberOutlined} value={ticketsOuverts}    label="Tickets ouverts"        color="#2563EB" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={PriorityHighOutlined}       value={ticketsCritiques}  label="Tickets critiques"      color="#EF4444" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={TimerOutlined}              value={`${delaiMoyen}h`}  label="Délai moyen résolution" color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard icon={PeopleOutlined}             value={techniciensActifs} label="Techniciens actifs"     color="#22C55E" />
        </Grid>
      </Grid>

      {/* ── BarChart — seul sur sa ligne ── */}
      <Box sx={{ marginBottom: '20px' }}>
        <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)' } }}>
          <CardContent sx={{ padding: '28px !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '15px', marginBottom: '24px' }}>
              Tickets par statut
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ticketParStatut} barSize={45} barGap={12}>
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
      </Box>

      {/* ── LineChart — seul sur sa ligne ── */}
      <Box sx={{ marginBottom: '28px' }}>
        <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.07)' } }}>
          <CardContent sx={{ padding: '28px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>
                Évolution sur 7 jours
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpOutlined sx={{ color: '#22C55E', fontSize: 18 }} />
                <Typography sx={{ color: '#22C55E', fontWeight: 600, fontSize: '13px' }}>+12%</Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={evolutionTickets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="jour" stroke="#9CA3AF" style={{ fontSize: '13px' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '13px' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: '#FFFFFF', stroke: '#2563EB', strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* ── Alertes + Performance ── */}
      <Grid container spacing={3}>

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
                <Typography sx={{ color: '#22C55E', fontWeight: 700, fontSize: '15px' }}>Aucune alerte critique</Typography>
                <Typography sx={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>Tous les tickets urgents sont assignés</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {alertes.map(ticket => (
                  <Box key={ticket.id} sx={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #FECACA', background: '#FFF5F5', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <AlertCard ticket={ticket} />
                    <Box sx={{ display: 'flex', gap: 1, marginTop: '4px' }}>
                      <Badge status={ticket.statut} />
                      <Badge status={ticket.priorite} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

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
                        {tech.enCours > 0 ? <Badge status="in_progress" /> : <Badge status="closed" />}
                        <Typography sx={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{tech.enCours}</Typography>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {tech.resolus > 0 ? <Badge status="resolved" /> : <Badge status="closed" />}
                        <Typography sx={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{tech.resolus}</Typography>
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
}q