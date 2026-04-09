$ErrorActionPreference = "Stop"

$baseUrls = @("http://localhost:8081", "http://localhost:8080")
$baseUrl = $null

foreach ($u in $baseUrls) {
    try {
        $probe = Invoke-WebRequest -Uri "$u/api/auth/login" -Method POST -Body "{}" -ContentType "application/json" -TimeoutSec 3
        if ($probe.StatusCode -ge 200) {
            $baseUrl = $u
            break
        }
    } catch {
        if ($_.Exception.Response -and ($_.Exception.Response.StatusCode.value__ -in 400, 401, 403, 415)) {
            $baseUrl = $u
            break
        }
    }
}

if (-not $baseUrl) {
    throw "Backend is not reachable on 8081 or 8080."
}

function Login-User {
    param(
        [Parameter(Mandatory = $true)][string]$email,
        [Parameter(Mandatory = $true)][string]$password
    )

    $payload = @{ email = $email; password = $password } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $payload -ContentType "application/json"

    if (-not $resp.success) {
        throw "Login failed for $email"
    }

    return $resp.data.token
}

function Ensure-User {
    param(
        [Parameter(Mandatory = $true)][string]$name,
        [Parameter(Mandatory = $true)][string]$email,
        [Parameter(Mandatory = $true)][string]$password,
        [Parameter(Mandatory = $true)][string]$role
    )

    try {
        return Login-User -email $email -password $password
    } catch {
        $registerPayload = @{ name = $name; email = $email; password = $password; role = $role } | ConvertTo-Json
        try {
            $null = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerPayload -ContentType "application/json"
        } catch {
            # Ignore registration conflicts and retry login.
        }

        return Login-User -email $email -password $password
    }
}

$studentEmail = "student@campusflow.local"
$studentPass = "Student@1234"
$staffEmail = "staff@campusflow.local"
$staffPass = "Staff@1234"

$studentToken = Ensure-User -name "Seed Student" -email $studentEmail -password $studentPass -role "USER"
$staffToken = Ensure-User -name "Seed Staff" -email $staffEmail -password $staffPass -role "TECHNICIAN"

$studentHeaders = @{ Authorization = "Bearer $studentToken" }
$staffHeaders = @{ Authorization = "Bearer $staffToken" }

$resourcesResp = Invoke-RestMethod -Uri "$baseUrl/api/resources" -Method GET -Headers $studentHeaders
$resources = @()
if ($resourcesResp -and $resourcesResp.data) {
    $resources = @($resourcesResp.data)
}

if ($resources.Count -eq 0) {
    $adminEmail = "admin@campusflow.local"
    $adminPass = "Admin@1234"
    $adminToken = $null
    try {
        $adminToken = Login-User -email $adminEmail -password $adminPass
    } catch {
        throw "No resources found and admin login failed. Create at least one resource or restore admin credentials, then run again."
    }

    $adminHeaders = @{ Authorization = "Bearer $adminToken" }

    $newResourcePayload = @{
        name = "Lecture Hall Seed A"
        type = "LECTURE_HALL"
        capacity = 120
        location = "Block A - Level 2"
        availabilityWindows = "Mon-Fri 08:00-18:00"
        status = "ACTIVE"
        description = "Seeded resource for booking test data"
        imageUrl = ""
    } | ConvertTo-Json

    $createdResource = Invoke-RestMethod -Uri "$baseUrl/api/resources" -Method POST -Headers $adminHeaders -Body $newResourcePayload -ContentType "application/json"
    $resourceId = $createdResource.data.id
} else {
    $resourceId = $resources[0].id
}

$today = Get-Date
$date1 = $today.AddDays(2).ToString("yyyy-MM-dd")
$date2 = $today.AddDays(3).ToString("yyyy-MM-dd")
$date3 = $today.AddDays(4).ToString("yyyy-MM-dd")

$bookingPayloads = @(
    @{ resource_id = $resourceId; date = $date1; start_time = "09:00:00"; end_time = "10:30:00"; purpose = "Data Structures Revision"; attendees = 30 },
    @{ resource_id = $resourceId; date = $date2; start_time = "11:00:00"; end_time = "12:00:00"; purpose = "Lab Consultation Session"; attendees = 20 },
    @{ resource_id = $resourceId; date = $date3; start_time = "14:00:00"; end_time = "15:00:00"; purpose = "Project Demo Prep"; attendees = 25 }
)

$created = @()
$created += Invoke-RestMethod -Uri "$baseUrl/api/bookings" -Method POST -Headers $studentHeaders -Body ($bookingPayloads[0] | ConvertTo-Json) -ContentType "application/json"
$created += Invoke-RestMethod -Uri "$baseUrl/api/bookings" -Method POST -Headers $staffHeaders -Body ($bookingPayloads[1] | ConvertTo-Json) -ContentType "application/json"
$created += Invoke-RestMethod -Uri "$baseUrl/api/bookings" -Method POST -Headers $studentHeaders -Body ($bookingPayloads[2] | ConvertTo-Json) -ContentType "application/json"

Write-Output "Base URL: $baseUrl"
Write-Output "Resource ID used: $resourceId"
Write-Output "Created bookings:"
$created | ForEach-Object {
    Write-Output "- $($_.data.booking_id) | status=$($_.data.status) | user=$($_.data.user_name) | date=$($_.data.date) | $($_.data.start_time)-$($_.data.end_time)"
}
