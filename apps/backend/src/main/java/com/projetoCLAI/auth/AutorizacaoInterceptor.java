package com.projetoCLAI.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class AutorizacaoInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws IOException {

        String metodo = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(metodo)) {
            return true;
        }

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(AuthController.ATTR_USUARIO_EMAIL) == null) {
            escreverErro(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Sua sessão não está ativa. Entre para continuar.");
            return false;
        }

        if (!"GET".equalsIgnoreCase(metodo) && !"HEAD".equalsIgnoreCase(metodo)) {
            String csrfHeader = request.getHeader(AuthController.CSRF_HEADER_NAME);
            String csrfSessao = (String) session.getAttribute(AuthController.ATTR_CSRF_TOKEN);
            boolean plano = request.getRequestURI().startsWith("/planos-acao");
            if ((plano && (csrfHeader == null || csrfSessao == null))
                    || (csrfHeader != null && csrfSessao != null && !csrfSessao.equals(csrfHeader))) {
                escreverErro(response, HttpServletResponse.SC_FORBIDDEN,
                        "Token de segurança inválido. Atualize a página e tente novamente.");
                return false;
            }
        }

        String perfilStr = (String) session.getAttribute(AuthController.ATTR_USUARIO_PERFIL);
        PerfilUsuario perfil = PerfilUsuario.fromString(perfilStr);
        String permissaoNecessaria = resolverPermissao(request.getRequestURI(), metodo);

        if (permissaoNecessaria != null && (!perfil.getPermissoes().contains(permissaoNecessaria)
                || (permissaoNecessaria.startsWith("planos:")
                    && !PerfilUsuario.PROFISSIONAL_CLAI.name().equals(perfilStr)))) {
            escreverErro(response, HttpServletResponse.SC_FORBIDDEN,
                    "Você não tem permissão para realizar esta ação.");
            return false;
        }

        return true;
    }

    private String resolverPermissao(String uri, String metodo) {
        boolean leitura = "GET".equalsIgnoreCase(metodo) || "HEAD".equalsIgnoreCase(metodo);
        if (uri.startsWith("/alunos")) {
            return leitura ? "alunos:consultar" : "alunos:cadastrar";
        }
        if (uri.startsWith("/atendimentos")) {
            return leitura ? "atendimentos:consultar" : "atendimentos:cadastrar";
        }
        if (uri.startsWith("/planos-acao")) {
            return leitura ? "planos:consultar" : "planos:cadastrar";
        }
        return null;
    }

    private void escreverErro(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"Erro\":\"" + mensagem + "\"}");
    }
}

