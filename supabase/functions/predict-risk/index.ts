import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

interface Location {
  lat: number
  lng: number
}

interface Disruption {
  location: Location
  type: string
  severity: string
}

interface PredictRiskRequest {
  route: Location[]
  disruptions: Disruption[]
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { route, disruptions }: PredictRiskRequest = await req.json()

    let riskScore = 0
    let delayHours = 0
    let reason = "No significant risks detected"
    let suggestedRoute: Location[] = []

    const severityWeights = {
      low: 10,
      medium: 20,
      high: 30,
      critical: 40,
    }

    const affectedPoints: number[] = []

    disruptions.forEach((disruption) => {
      route.forEach((point, index) => {
        const distance = calculateDistance(point, disruption.location)

        if (distance < 100) {
          const weight = severityWeights[disruption.severity as keyof typeof severityWeights] || 10
          riskScore += weight
          delayHours += weight / 5
          affectedPoints.push(index)

          if (reason === "No significant risks detected") {
            reason = `${disruption.type} disruption detected near route`
          }
        }
      })
    })

    riskScore = Math.min(100, Math.round(riskScore))
    delayHours = Math.round(delayHours)

    if (riskScore > 70 && affectedPoints.length > 0) {
      suggestedRoute = generateAlternateRoute(route, affectedPoints)
    }

    const data = {
      risk_score: riskScore,
      delay_hours: delayHours,
      reason,
      suggested_route: suggestedRoute.length > 0 ? suggestedRoute : null,
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    )
  }
})

function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function generateAlternateRoute(
  originalRoute: Location[],
  affectedPoints: number[]
): Location[] {
  const alternateRoute = [...originalRoute]

  affectedPoints.forEach((index) => {
    if (index > 0 && index < originalRoute.length - 1) {
      const prev = originalRoute[index - 1]
      const next = originalRoute[index + 1]

      alternateRoute[index] = {
        lat: (prev.lat + next.lat) / 2 + (Math.random() - 0.5) * 0.5,
        lng: (prev.lng + next.lng) / 2 + (Math.random() - 0.5) * 0.5,
      }
    }
  })

  return alternateRoute
}
