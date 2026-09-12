package com.aicareermentor.backend;

import com.aicareermentor.backend.entity.Career;
import com.aicareermentor.backend.repository.CareerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeCareers(CareerRepository careerRepository) {

        return args -> {

            if (careerRepository.count() > 0) {
                return;
            }

            Career dataAnalyst = new Career();
            dataAnalyst.setCareerId("data-analyst");
            dataAnalyst.setTitle("Data Analyst");
            dataAnalyst.setTagline("Turn data into meaningful insights.");
            dataAnalyst.setDescription(
                    "Analyze data, identify patterns and help organizations make better decisions."
            );
            dataAnalyst.setGrowth(
                    "Strong growth opportunities across technology, finance, healthcare and consulting."
            );
            dataAnalyst.setSalaryRange("₹4 LPA - ₹12 LPA");
            dataAnalyst.setSkills("SQL, Excel, Python, Data Visualization, Statistics");
            dataAnalyst.setResponsibilities(
                    "Collect and analyze data, create reports, identify trends, build dashboards"
            );
            dataAnalyst.setAvgSalary("₹7 LPA");
            dataAnalyst.setDemand("High");
            dataAnalyst.setTopLocation("Bengaluru");
            dataAnalyst.setGlobalOpportunities(
                    "Technology, finance, healthcare, consulting and e-commerce"
            );
            dataAnalyst.setAnalyticalScore(95);
            dataAnalyst.setTechnicalScore(70);
            dataAnalyst.setCommunicationScore(75);
            dataAnalyst.setLeadershipScore(55);
            dataAnalyst.setCreativeScore(65);

            careerRepository.save(dataAnalyst);


            Career softwareDeveloper = new Career();
            softwareDeveloper.setCareerId("software-developer");
            softwareDeveloper.setTitle("Software Developer");
            softwareDeveloper.setTagline("Build applications and solve technical problems.");
            softwareDeveloper.setDescription(
                    "Design, develop, test and maintain software applications."
            );
            softwareDeveloper.setGrowth(
                    "Excellent growth opportunities across technology companies and startups."
            );
            softwareDeveloper.setSalaryRange("₹4 LPA - ₹15 LPA");
            softwareDeveloper.setSkills(
                    "Java, Python, JavaScript, Spring Boot, React, SQL, Git"
            );
            softwareDeveloper.setResponsibilities(
                    "Design software, write code, test applications, fix bugs and maintain systems"
            );
            softwareDeveloper.setAvgSalary("₹8 LPA");
            softwareDeveloper.setDemand("Very High");
            softwareDeveloper.setTopLocation("Bengaluru");
            softwareDeveloper.setGlobalOpportunities(
                    "Software companies, startups, fintech, cloud computing and IT services"
            );
            softwareDeveloper.setAnalyticalScore(80);
            softwareDeveloper.setTechnicalScore(98);
            softwareDeveloper.setCommunicationScore(65);
            softwareDeveloper.setLeadershipScore(55);
            softwareDeveloper.setCreativeScore(75);

            careerRepository.save(softwareDeveloper);


            Career projectManager = new Career();
            projectManager.setCareerId("project-manager");
            projectManager.setTitle("Project Manager");
            projectManager.setTagline("Lead teams and deliver projects successfully.");
            projectManager.setDescription(
                    "Plan projects, coordinate teams, manage risks and ensure successful delivery."
            );
            projectManager.setGrowth(
                    "Strong opportunities in technology, consulting and business operations."
            );
            projectManager.setSalaryRange("₹6 LPA - ₹18 LPA");
            projectManager.setSkills(
                    "Project Planning, Communication, Leadership, Risk Management, Agile"
            );
            projectManager.setResponsibilities(
                    "Plan projects, coordinate teams, manage schedules, track risks and communicate progress"
            );
            projectManager.setAvgSalary("₹11 LPA");
            projectManager.setDemand("High");
            projectManager.setTopLocation("Mumbai");
            projectManager.setGlobalOpportunities(
                    "Technology, consulting, finance, construction and business operations"
            );
            projectManager.setAnalyticalScore(75);
            projectManager.setTechnicalScore(55);
            projectManager.setCommunicationScore(90);
            projectManager.setLeadershipScore(95);
            projectManager.setCreativeScore(70);

            careerRepository.save(projectManager);


            Career productManager = new Career();
            productManager.setCareerId("product-manager");
            productManager.setTitle("Product Manager");
            productManager.setTagline("Turn ideas into products people love.");
            productManager.setDescription(
                    "Define product strategy, understand users and work with teams to build useful products."
            );
            productManager.setGrowth(
                    "High-growth career path with opportunities in technology and startups."
            );
            productManager.setSalaryRange("₹8 LPA - ₹25 LPA");
            productManager.setSkills(
                    "Product Strategy, User Research, Communication, Analytics, Agile"
            );
            productManager.setResponsibilities(
                    "Define product strategy, research users, prioritize features and coordinate development teams"
            );
            productManager.setAvgSalary("₹14 LPA");
            productManager.setDemand("Very High");
            productManager.setTopLocation("Bengaluru");
            productManager.setGlobalOpportunities(
                    "Technology companies, startups, SaaS, fintech and e-commerce"
            );
            productManager.setAnalyticalScore(85);
            productManager.setTechnicalScore(65);
            productManager.setCommunicationScore(95);
            productManager.setLeadershipScore(90);
            productManager.setCreativeScore(90);

            careerRepository.save(productManager);


            Career hrSpecialist = new Career();
            hrSpecialist.setCareerId("hr-specialist");
            hrSpecialist.setTitle("HR Specialist");
            hrSpecialist.setTagline("Help people and organizations grow together.");
            hrSpecialist.setDescription(
                    "Support recruitment, employee development, workplace policies and people operations."
            );
            hrSpecialist.setGrowth(
                    "Opportunities across almost every industry and organization."
            );
            hrSpecialist.setSalaryRange("₹3.5 LPA - ₹10 LPA");
            hrSpecialist.setSkills(
                    "Communication, Recruitment, Employee Relations, Organization, Conflict Resolution"
            );
            hrSpecialist.setResponsibilities(
                    "Recruit employees, support employee development, manage workplace policies and assist people operations"
            );
            hrSpecialist.setAvgSalary("₹6 LPA");
            hrSpecialist.setDemand("High");
            hrSpecialist.setTopLocation("Mumbai");
            hrSpecialist.setGlobalOpportunities(
                    "Technology, healthcare, finance, consulting, education and retail"
            );
            hrSpecialist.setAnalyticalScore(60);
            hrSpecialist.setTechnicalScore(35);
            hrSpecialist.setCommunicationScore(95);
            hrSpecialist.setLeadershipScore(80);
            hrSpecialist.setCreativeScore(70);

            careerRepository.save(hrSpecialist);


            Career cybersecurityAnalyst = new Career();
            cybersecurityAnalyst.setCareerId("cybersecurity-analyst");
            cybersecurityAnalyst.setTitle("Cybersecurity Analyst");
            cybersecurityAnalyst.setTagline("Protect systems, data and organizations.");
            cybersecurityAnalyst.setDescription(
                    "Monitor security systems, investigate threats and help protect digital infrastructure."
            );
            cybersecurityAnalyst.setGrowth(
                    "Strong demand as organizations increasingly prioritize cybersecurity."
            );
            cybersecurityAnalyst.setSalaryRange("₹5 LPA - ₹18 LPA");
            cybersecurityAnalyst.setSkills(
                    "Network Security, Ethical Hacking, Linux, SIEM, Cryptography"
            );
            cybersecurityAnalyst.setResponsibilities(
                    "Monitor security systems, investigate threats, identify vulnerabilities and protect digital infrastructure"
            );
            cybersecurityAnalyst.setAvgSalary("₹9 LPA");
            cybersecurityAnalyst.setDemand("Very High");
            cybersecurityAnalyst.setTopLocation("Bengaluru");
            cybersecurityAnalyst.setGlobalOpportunities(
                    "Cybersecurity firms, banks, technology companies, government and consulting"
            );
            cybersecurityAnalyst.setAnalyticalScore(90);
            cybersecurityAnalyst.setTechnicalScore(95);
            cybersecurityAnalyst.setCommunicationScore(60);
            cybersecurityAnalyst.setLeadershipScore(65);
            cybersecurityAnalyst.setCreativeScore(70);

            careerRepository.save(cybersecurityAnalyst);


            System.out.println("Career data initialized successfully.");
        };
    }
}