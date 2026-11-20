-include .env
export

# Servidor Locaweb (Docker). Antes rodava no droplet DigitalOcean com nvm + pm2 (ver histórico do git).
DEPLOY_HOST ?= root@191.252.192.196
DIR         := /opt/lottery

.PHONY: deploy rollback logs env

## Envia o código, gera a imagem no servidor e reinicia
deploy:
	ssh $(DEPLOY_HOST) "mkdir -p $(DIR)/src"
	git ls-files -z --cached --others --exclude-standard | rsync -az --delete --from0 --files-from=- ./ $(DEPLOY_HOST):$(DIR)/src/
	scp -q compose.production.yml $(DEPLOY_HOST):$(DIR)/compose.yml
	@ssh $(DEPLOY_HOST) "test -f $(DIR)/.env" || $(MAKE) env
	ssh $(DEPLOY_HOST) "cd $(DIR) && (docker image inspect lottery-app:latest >/dev/null 2>&1 && docker tag lottery-app:latest lottery-app:previous || true) && docker compose build app && docker compose up -d && docker image prune -f >/dev/null"
	@echo "→ Deploy concluído. Rollback: make rollback"

## Cria /opt/lottery/.env no servidor. A API da Caixa é chamada direto (servidor no Brasil); proxy não é usado.
env:
	@printf 'DEFAULT_LOTTERY_CODE=%s\n' "$(or $(DEFAULT_LOTTERY_CODE),lotomania)" | ssh $(DEPLOY_HOST) "umask 077 && cat > $(DIR)/.env"
	@echo "→ .env criado no servidor"

## Volta para a imagem anterior
rollback:
	ssh $(DEPLOY_HOST) "cd $(DIR) && docker tag lottery-app:previous lottery-app:latest && docker compose up -d --no-build app"

logs:
	ssh $(DEPLOY_HOST) "journalctl -t lottery-app -n 100 -f -o cat"
