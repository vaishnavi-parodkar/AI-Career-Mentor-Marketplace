package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.Mentor;
import com.aicareermentor.backend.entity.MentorContent;
import com.aicareermentor.backend.repository.MentorContentRepository;
import com.aicareermentor.backend.repository.MentorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;

/** Seeds the mentor catalogue (matching the frontend mentor ids) and starter mentor-approved content. */
@Configuration
public class MentorSeedRunner {

    private static final Logger log = LoggerFactory.getLogger(MentorSeedRunner.class);

    @Bean
    @Order(3)
    CommandLineRunner seedMentors(MentorRepository mentors, MentorContentRepository contents, ObjectMapper mapper) {
        return args -> {
            if (mentors.findBySlug("data-analyst-mentor").isPresent()) {
                return; // already seeded
            }
            try (InputStream in = new ClassPathResource("mentors-seed.json").getInputStream()) {
                JsonNode root = mapper.readTree(in);
                for (JsonNode n : root) {
                    Mentor m = new Mentor();
                    m.setName(n.path("name").asText());
                    m.setSpecialization(n.path("specialization").asText());
                    m.setDescription(n.path("description").asText());
                    m.setExperience(n.path("experience").asText());
                    m.setRating(n.path("rating").asDouble(4.5));
                    m.setAvailable(true);
                    m.slug = n.path("slug").asText();
                    m.profession = n.path("profession").asText();
                    m.category = n.path("category").asText();
                    m.careerId = n.path("careerId").asText();
                    m.skills = n.path("skills").asText();
                    m.languages = n.path("languages").asText();
                    m.hourlyRate = n.path("hourlyRate").asInt(500);
                    m.yearsExperience = n.path("yearsExperience").asInt(5);
                    m.bio = n.path("bio").asText();
                    m.company = n.path("company").asText();
                    m.avatarColor = n.path("avatarColor").asText();
                    m.topics = n.path("topics").asText();
                    m.availableDays = n.path("availableDays").asText();
                    m.personaPrompt = n.path("personaPrompt").asText();
                    Mentor saved = mentors.save(m);

                    MentorContent c = new MentorContent();
                    c.mentorId = saved.getId();
                    c.title = "How I suggest you start in " + saved.getSpecialization();
                    c.body = "Start with the fundamentals (" + saved.skills + "), build one small end-to-end project "
                            + "every two weeks, publish it on GitHub or a portfolio, and practise explaining your "
                            + "decisions out loud. Review your progress with a mentor every few weeks.";
                    c.approved = true;
                    c.submittedBy = "seed";
                    contents.save(c);
                }
                log.info("Seeded {} mentors", root.size());
            } catch (Exception e) {
                log.warn("Mentor seeding failed: {}", e.getMessage());
            }
        };
    }
}
