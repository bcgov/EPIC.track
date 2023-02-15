package org.camunda.bpm.extension.hooks.listeners;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.DelegateTask;
import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.TaskListener;
import org.camunda.bpm.extension.hooks.listeners.data.Email;
import org.camunda.bpm.extension.hooks.listeners.data.TokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Base64Utils;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.logging.Logger;

import javax.inject.Named;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;

import static org.camunda.bpm.extension.commons.utils.VariableConstants.TEMPLATE;

@Named("CustomCommonEmailServiceListener")
public class CustomCommonEmailServiceListener extends BaseListener implements ExecutionListener, TaskListener {

    private final Logger LOGGER = Logger.getLogger(CustomCommonEmailServiceListener.class.getName());

    private WebClient webClient = null;

    @Value("${ches.auth.tokenUri}")
    private String authTokenUri;

    @Value("${ches.reminderConfigurationUri}")
    private String reminderConfigurationUri;

    @Value("${ches.auth.clientId}")
    private String clientId;

    @Value("${ches.auth.clientSecret}")
    private String clientSecret;

    @Override
    public void notify(DelegateExecution execution) throws Exception {
        sendEmail(execution);
    }

    @Override
    public void notify(DelegateTask delegateTask) {
        sendEmail(delegateTask.getExecution());
    }

    public void sendEmail(DelegateExecution execution) {
        try {
            webClient = setWebclient();

            Mono<ResponseEntity<String>> entityMono = webClient
                    .post()
                    .uri(reminderConfigurationUri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + getAccessToken())
                    .accept(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(getEmailData(execution))
                    .retrieve()
                    .toEntity(String.class);

            ResponseEntity<String> response = entityMono.block();
            LOGGER.info("Email Response : " + response);

        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }

    private String getAccessToken() {
        webClient = setWebclient();

        String encodedClientData =

                Base64Utils.encodeToString(String.format("%0:%1", clientId, clientSecret).getBytes(StandardCharsets.UTF_8));

        TokenResponse response = webClient
                .post()
                .uri(authTokenUri)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .header("Authorization", "Basic" + " " + encodedClientData)
                .body(BodyInserters.fromFormData("grant_type", "client_credentials"))
                .retrieve()
                .bodyToMono(TokenResponse.class)
                .block();
        return response.getAccess_token();
        LOGGER.info("Access Token : " + response.getAccess_token());

    }

    private WebClient setWebclient() {
        if (webClient == null) {
            return WebClient.builder()
                    .build();
        }
        return webClient;
    }

    private Email getEmailData(DelegateExecution execution) throws JsonProcessingException {
        Map<String, Object> dmnMap = getDMNTemplate(execution);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        Email email = objectMapper.convertValue(dmnMap, Email.class);

  /*    Email email = new Email();
        email.setTo(Collections.singletonList(String.valueOf(getDmnValue(dmnMap, "to"))));
        email.setFrom(getDmnValue(dmnMap, "from"));
        email.setBody(getDmnValue(dmnMap, "body"));
        email.setSubject(getDmnValue(dmnMap, "subject"));
        email.setBodyType(getDmnValue(dmnMap, "bodyType"));*/

        return email;
    }

    private Map<String, Object> getDMNTemplate(DelegateExecution execution) {
        return (Map<String, Object>) execution.getVariables().get(TEMPLATE);
    }

//    private String getDmnValue(Map<String, Object> dmnMap, String name) {
//        return String.valueOf(dmnMap.get(name));
//    }

}
