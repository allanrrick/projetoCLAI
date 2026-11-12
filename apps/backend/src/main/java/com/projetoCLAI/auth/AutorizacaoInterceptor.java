package com.projetoCLAI.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class AutorizacaoInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws IOException {

        String metodo = request.getMethod().toUpperCase(Locale.ROOT);
        String uri = request.getRequestURI();

        if ("OPTIONS".equals(metodo)) {
            return true;
        }

        // Verificar sessão
        HttpSession session = request.getSession(false);

        if (session == null
                || session.getAttribute(AuthController.ATTR_USUARIO_ID) == null
                || session.getAttribute(AuthController.ATTR_USUARIO_EMAIL) == null
                || session.getAttribute(AuthController.ATTR_USUARIO_PERFIL) == null) {

            escreverErro(
                    response,
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Sua sessão não está ativa. Entre para continuar."
            );

            return false;
        }

        // Verificar CSRF em requisições que modificam dados
        if (!"GET".equals(metodo) && !"HEAD".equals(metodo)) {

            String csrfHeader = request.getHeader(
                    AuthController.CSRF_HEADER_NAME
            );

            String csrfSessao = (String) session.getAttribute(
                    AuthController.ATTR_CSRF_TOKEN
            );

            if (csrfHeader == null
                    || csrfSessao == null
                    || !csrfSessao.equals(csrfHeader)) {

                escreverErro(
                        response,
                        HttpServletResponse.SC_FORBIDDEN,
                        "Token de segurança inválido ou ausente."
                );

                return false;
            }
        }

        // Verificar perfil
        String perfilStr = (String) session.getAttribute(
                AuthController.ATTR_USUARIO_PERFIL
        );

        PerfilUsuario perfil;

        try {
            perfil = PerfilUsuario.fromString(perfilStr);
        } catch (IllegalArgumentException e) {

            escreverErro(
                    response,
                    HttpServletResponse.SC_FORBIDDEN,
                    "Perfil de usuário inválido."
            );

            return false;
        }

        // Verificar permissão necessária
        String permissaoNecessaria = resolverPermissao(uri, metodo);

        if (permissaoNecessaria == null) {

            escreverErro(
                    response,
                    HttpServletResponse.SC_FORBIDDEN,
                    "Não existe uma permissão configurada para esta ação."
            );

            return false;
        }

        if (!perfil.getPermissoes().contains(permissaoNecessaria)) {

            escreverErro(
                    response,
                    HttpServletResponse.SC_FORBIDDEN,
                    "Você não tem permissão para realizar esta ação."
            );

            return false;
        }

        return true;
    }

    private String resolverPermissao(String uri, String metodo) {

        if (uri.startsWith("/alunos")) {

            return switch (metodo) {
                case "GET", "HEAD" -> "alunos:consultar";
                case "POST" -> "alunos:cadastrar";
                case "PUT", "PATCH" -> "alunos:editar";
                case "DELETE" -> "alunos:desativar";
                default -> null;
            };
        }

        if (uri.startsWith("/atendimentos")) {

            return switch (metodo) {
                case "GET", "HEAD" -> "atendimentos:consultar";
                case "POST", "PUT", "PATCH", "DELETE" -> "atendimentos:cadastrar";
                default -> null;
            };
        }

        if (uri.startsWith("/planos-acao")) {

            return switch (metodo) {
                case "GET", "HEAD" -> "planos:consultar";
                case "POST", "PUT", "PATCH", "DELETE" -> "planos:cadastrar";
                default -> null;
            };
        }

        return null;
    }

    private void escreverErro(
            HttpServletResponse response,
            int status,
            String mensagem) throws IOException {

        response.setStatus(status);
        response.setCharacterEncoding(
                StandardCharsets.UTF_8.name()
        );
        response.setContentType("application/json;charset=UTF-8");

        response.getWriter().write(
                "{\"Erro\":\"" + mensagem + "\"}"
        );
    }
}
