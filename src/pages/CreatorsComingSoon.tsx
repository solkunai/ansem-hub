import { Card } from '../components/ui/Card'

export default function CreatorsComingSoon() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="disp text-2xl uppercase text-ink-primary">creators</h1>
        <span className="tnum text-xs text-ink-muted">shill $ANSEM, earn points</span>
      </div>

      <Card className="py-10 text-center">
        <div className="disp text-xl uppercase text-green">coming soon</div>
        <p className="mt-2 text-sm uppercase text-ink-secondary">don't stop bull posting ANSEM</p>
      </Card>
    </div>
  )
}
