This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## State-scoped producer admin APIs

Administrative tooling for producers is scoped to a specific state. All server and
client code that creates, lists, updates, or deletes producers **must** provide a
state slug and will be rejected if the slug does not resolve to a known state.

- `GET /api/producers` requires a `state=<slug>` query parameter. The results only
  include producers from that state and each producer record includes the related
  state slug for client-side validation.
- `POST /api/admin/create-producer` accepts a state slug (legacy state codes are
  still accepted when a slug is not available). The slug must map to an existing
  state and, when both slug and code are supplied, they must refer to the same
  record.
- `PUT` and `DELETE /api/producers/[id]` require a `state=<slug>` query parameter.
  The request will only succeed if the producer belongs to the provided slug.
  Update requests silently ignore any attempt to move a producer between states.

Future state-admin tooling should follow the same pattern: look up the state by
slug first, validate that the requested producer belongs to that state, and avoid
mutating `stateId` outside of dedicated migration flows.
