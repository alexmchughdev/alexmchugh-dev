# Deploying alexmchugh.dev

The pipeline mirrors [getdfx.uk / ot-edge-asset-tag-generator](https://github.com/alexmchughdev/OT-edge-asset-tag-generator): commit to `main` → GHCR image → CI rewrites the image tag in `k8s/` → ArgoCD reconciles into the cluster.

## Layout

```
.
├── Dockerfile                          # multi-stage: node:20-alpine → nginx:alpine
├── nginx.conf                          # listen 80, SPA fallback, /cv.pdf alias
├── .github/workflows/
│   ├── build-push.yaml                 # build/push + image-tag bump on push to main
│   └── refresh-github-data.yaml        # daily fetch of pinned repos + contribution graph
├── k8s/
│   ├── kustomization.yaml              # namespace: alexmchugh-dev, images field is CI-rewritten
│   ├── deployment.yaml                 # 1 replica, 100m CPU / 128Mi limit
│   ├── service.yaml                    # ClusterIP :80
│   └── ingress.yaml                    # nginx class, cert-manager letsencrypt-prod
└── argocd/
    └── application.yaml                # ArgoCD Application resource
```

## One-time cluster setup

1. **Package visibility** — after the first successful image push to `ghcr.io/alexmchughdev/alexmchugh-dev`, open the package in GitHub → Package settings → change visibility to **Public**. Otherwise the cluster will need a pull secret.

2. **Apply the ArgoCD Application**:

   ```
   kubectl apply -f argocd/application.yaml
   ```

   ArgoCD will create the `alexmchugh-dev` namespace if it does not exist and start reconciling `k8s/` into it.

3. **cert-manager ClusterIssuer** — this manifest assumes a `letsencrypt-prod` ClusterIssuer already exists in the cluster (same one getdfx uses). If not:

   ```
   apiVersion: cert-manager.io/v1
   kind: ClusterIssuer
   metadata:
     name: letsencrypt-prod
   spec:
     acme:
       server: https://acme-v02.api.letsencrypt.org/directory
       email: alex@alexmchugh.dev
       privateKeySecretRef:
         name: letsencrypt-prod
       solvers:
         - http01:
             ingress:
               ingressClassName: nginx
   ```

4. **Ingress controller** — manifest sets `ingressClassName: nginx`. If the cluster runs Traefik (k3s default) instead, either install ingress-nginx or change the ingress class and annotations accordingly.

## DNS (Cloudflare)

The TLS cert is obtained via HTTP-01, which requires port 80 to reach the ingress controller. Two supported topologies:

### A. Cloudflare Tunnel (recommended, matches getdfx)

Add a public hostname to the existing cloudflared tunnel that getdfx already uses:

```yaml
- hostname: alexmchugh.dev
  service: http://<ingress-nginx-controller-service>.ingress-nginx.svc.cluster.local:80
```

Or run an `ingress`-level Tunnel ingress and terminate TLS at the ingress controller. Cloudflare can be set to **Full (strict)** mode since ingress-nginx will be serving a valid Let's Encrypt cert.

Cloudflare DNS record created by the tunnel:
- Type: `CNAME`
- Name: `alexmchugh.dev`
- Target: `<tunnel-id>.cfargotunnel.com`
- Proxied: yes

### B. Direct A record (if tunnel not used)

- Type: `A`
- Name: `@` (or `alexmchugh.dev`)
- Value: public IP of the ingress controller
- Proxied: off (needed for HTTP-01 challenge) — flip to proxied once the cert is issued

## Updating content

Push to `main`. The `Build & Push` workflow:

1. Builds the Docker image from the repo root.
2. Pushes `ghcr.io/alexmchughdev/alexmchugh-dev:sha-<short>` and `:latest`.
3. Rewrites `k8s/kustomization.yaml` with the new short-SHA tag and commits back with a `[skip ci]` commit so it doesn't loop.

ArgoCD picks up the manifest change and rolls out the new image.

## Local smoke test

```
docker build -t alexmchugh-dev:local .
docker run --rm -p 8080:80 alexmchugh-dev:local
# http://localhost:8080
```
