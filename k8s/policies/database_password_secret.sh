read -s -p "Enter a strong demo database password: " DB_PASSWORD
echo
kubectl -n platform create secret generic postgres-credentials \
  --from-literal=POSTGRES_PASSWORD="$DB_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -
unset DB_PASSWORD