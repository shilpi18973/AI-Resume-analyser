# role -> {skill: weight (1 = nice to have, 3 = core)}
ROLES = {
 "AI/ML Engineer": {"python":3,"machine learning":3,"deep learning":3,"tensorflow":2,"pytorch":2,"scikit-learn":2,"nlp":2,"sql":1,"docker":1},
 "Data Scientist": {"python":3,"statistics":3,"machine learning":3,"pandas":2,"numpy":2,"sql":2,"data visualization":2,"scikit-learn":2},
 "Data Analyst": {"sql":3,"excel":3,"power bi":2,"tableau":2,"python":2,"pandas":2,"statistics":2,"data visualization":2},
 "Python Developer": {"python":3,"django":2,"flask":2,"fastapi":2,"sql":2,"git":2,"rest api":2,"docker":1},
 "Java Developer": {"java":3,"spring boot":3,"sql":2,"hibernate":2,"rest api":2,"git":2,"maven":1,"microservices":1},
 "Full Stack Developer": {"javascript":3,"react":3,"node.js":2,"html":2,"css":2,"sql":2,"mongodb":1,"git":2,"rest api":2},
 "Frontend Developer": {"html":3,"css":3,"javascript":3,"react":3,"typescript":2,"tailwind css":1,"git":2,"responsive design":2},
 "Backend Developer": {"python":2,"java":1,"node.js":2,"sql":3,"rest api":3,"docker":2,"git":2,"mongodb":1,"microservices":1},
}
SKILL_VOCAB = sorted({s for r in ROLES.values() for s in r} | {"c++","aws","linux","kubernetes","postgresql","mysql","jupyter","opencv","keras","angular","vue","spring","redis"})
SOFT_SKILLS = ["communication","teamwork","leadership","problem solving","time management","adaptability","critical thinking","creativity","collaboration"]
