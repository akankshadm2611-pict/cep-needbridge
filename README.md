# NeedBridge 🌉
> A precision platform connecting NGOs, volunteers, and resource donors around tracked community needs with zero surplus wastage.

## About

NeedBridge brings NGOs and community contributors together around clearly defined local needs. NGOs can publish opportunities for volunteer time or requested goods, while volunteers and donors can find ways to contribute and follow their applications through a role-specific dashboard.

## Features

- **NGO onboarding and verification:** NGOs create a profile and submit documents for administrator review.
- **Structured need and opportunity posts:** NGOs describe the need, category, urgency, location, required skills or goods, and deadline.
- **Volunteer and donor participation:** Contributors can discover opportunities, apply with their time, or pledge goods.
- **Relevant opportunity matching:** Suggestions consider factors such as location, skills or resource categories, urgency, and volunteer reliability.
- **Bounded goods pledges:** Pledged quantities are limited to the remaining amount needed, helping avoid surplus.
- **Role-based dashboards:** NGOs manage posts and applications; volunteers track matches and participation; administrators review NGO verification.
- **Notifications and progress tracking:** Users can keep track of application updates and community impact.
- **SmartText suggestions:** Helps NGOs draft needs by suggesting categories, urgency, contribution type, and SDG tags from their descriptions.
- **Persistent storage:** Production records are stored in MongoDB Atlas.

## USP

NeedBridge focuses on matching a specific community need with an appropriate contribution—not simply listing organizations or collecting donations. It brings needs, volunteer skills, resource pledges, and location together in one workflow. Quantity-aware pledges are designed to reduce over-allocation and waste, while NGO verification helps contributors make more informed choices.

## Why it is useful

NGOs often need to coordinate people and supplies across multiple channels. Potential volunteers and donors may not know which needs are current or where their contribution is most useful. NeedBridge makes needs more discoverable and structured, helps contributors find suitable opportunities, and gives both sides a shared place to manage participation.

## How to use the site

### Vercel deployment notes

This project is designed to run in Vercel without crashing when environment variables are missing during a fresh deployment.

1. Add `MONGODB_URI` in the Vercel project settings for production if you want Atlas-backed data.
2. Add a secure `JWT_SECRET` value in Vercel for production authentication.
3. If those values are not yet configured, the app will continue in local JSON fallback mode instead of exiting during deployment.

### As an NGO

1. Create an account and complete the NGO profile.
2. Submit registration or verification documents for administrator review.
3. Create a need or opportunity, including its location, category, urgency, deadline, and required time or goods.
4. Review incoming applications or pledges from the NGO dashboard and update their status.

### As a volunteer or donor

1. Create an account and complete your profile with your location, skills, interests, availability, and contribution type.
2. Browse opportunities or review suggested matches.
3. Open an opportunity to learn more, then apply with your time or pledge the requested goods.
4. Use your dashboard and notifications to follow updates to your participation.

### As an administrator

1. Sign in with an administrator account.
2. Review NGO verification submissions in the admin dashboard.
3. Approve or reject submissions so contributors can identify verified organizations.
